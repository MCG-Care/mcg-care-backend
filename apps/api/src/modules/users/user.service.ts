import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DB_PROVIDER } from '../../config/database.module';
import { db, Database } from '../../config/database';
import { schema } from '../../config/database';
import * as bcrypt from 'bcryptjs';
import { eq, sql, and, asc } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/address.dto';
import { TimeslotsService } from '../timeslots/timeslots.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_PROVIDER) private readonly db: Database,
    private readonly timeslotsService: TimeslotsService,
  ) {}

  async getAllUsers() {
    const results = await this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phoneNo: schema.users.phoneNo,
        role: schema.users.role,
        primaryAddressId: schema.users.primaryAddressId,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        primaryAddress: {
          id: schema.addresses.id,
          name: schema.addresses.name,
          address: schema.addresses.address,
          township: schema.addresses.township,
          city: schema.addresses.city,
          district: schema.addresses.district,
          createdAt: schema.addresses.createdAt,
          updatedAt: schema.addresses.updatedAt,
        },
      })
      .from(schema.users)
      .leftJoin(schema.addresses, eq(schema.users.primaryAddressId, schema.addresses.id));

    // Transform results to match expected format
    return results.map((result) => {
      const { primaryAddress, ...user } = result;
      return {
        ...user,
        address: primaryAddress && primaryAddress.id ? primaryAddress : null,
      };
    });
  }

  async getUserById(id: number, includeRating: boolean = false) {
    const results = await this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phoneNo: schema.users.phoneNo,
        role: schema.users.role,
        primaryAddressId: schema.users.primaryAddressId,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        primaryAddress: {
          id: schema.addresses.id,
          name: schema.addresses.name,
          address: schema.addresses.address,
          township: schema.addresses.township,
          city: schema.addresses.city,
          district: schema.addresses.district,
          createdAt: schema.addresses.createdAt,
          updatedAt: schema.addresses.updatedAt,
        },
      })
      .from(schema.users)
      .leftJoin(schema.addresses, eq(schema.users.primaryAddressId, schema.addresses.id))
      .where(eq(schema.users.id, id))
      .limit(1);

    const result = results[0] || null;
    if (!result) return null;

    // Transform result to match expected format
    const { primaryAddress, ...user } = result;
    const userWithAddress = {
      ...user,
      address: primaryAddress && primaryAddress.id ? primaryAddress : null,
    };

    // If user is a technician and rating is requested, include average rating
    if (includeRating && user.role === 'technician') {
      try {
        const ratingData = await this.getTechnicianAverageRating(id);
        return {
          ...userWithAddress,
          averageRating: ratingData.averageRatingRounded,
          totalFeedbacks: ratingData.totalFeedbacks,
        };
      } catch (error) {
        // If rating calculation fails, just return user without rating
        return userWithAddress;
      }
    }

    return userWithAddress;
  }

  async getUserByEmail(email: string) {
    const results = await this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        password: schema.users.password,
        phoneNo: schema.users.phoneNo,
        role: schema.users.role,
        primaryAddressId: schema.users.primaryAddressId,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        primaryAddress: {
          id: schema.addresses.id,
          name: schema.addresses.name,
          address: schema.addresses.address,
          township: schema.addresses.township,
          city: schema.addresses.city,
          district: schema.addresses.district,
          createdAt: schema.addresses.createdAt,
          updatedAt: schema.addresses.updatedAt,
        },
      })
      .from(schema.users)
      .leftJoin(schema.addresses, eq(schema.users.primaryAddressId, schema.addresses.id))
      .where(eq(schema.users.email, email))
      .limit(1);

    const result = results[0] || null;
    if (!result) return null;

    // Transform result to match expected format
    const { primaryAddress, ...user } = result;
    return {
      ...user,
      address: primaryAddress && primaryAddress.id ? primaryAddress : null,
    };
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    role: 'customer' | 'technician' | 'admin';
    primaryAddressId?: number | null;
  }) {
    const userData: any = {
      name: data.name,
      email: data.email,
      password: data.password,
      phoneNo: data.phoneNo,
      role: data.role,
    };
    
    if (data.primaryAddressId !== undefined) {
      userData.primaryAddressId = data.primaryAddressId;
    }
    
    const result = await this.db.insert(schema.users).values(userData).returning();
    const user = result[0];

    // If user is a technician, initialize timeslots
    if (user && user.role === 'technician') {
      try {
        if (!this.timeslotsService) {
          console.error('TimeslotsService is not injected!');
          throw new Error('TimeslotsService is not available');
        }
        console.log(`Initializing timeslots for technician ${user.id}...`);
        const result = await this.timeslotsService.initializeTechnicianTimeslots(user.id);
        console.log(`Successfully initialized timeslots:`, result);
      } catch (error) {
        // Log error but don't fail user creation if timeslot initialization fails
        console.error(`Failed to initialize timeslots for technician ${user.id}:`, error);
        console.error('Error details:', error instanceof Error ? error.message : error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      }
    }

    // Fetch user with address
    if (user) {
      return this.getUserById(user.id);
    }

    return user;
  }

  async createAddress(userId: number, dto: AddressDto) {
    // Generate default name from address if not provided
    let addressName = dto.name;
    if (!addressName || addressName.trim() === '') {
      // Use first part of address (up to 30 chars) or township as fallback
      if (dto.address && dto.address.trim()) {
        addressName = dto.address.trim().substring(0, 30);
        if (dto.address.length > 30) {
          addressName += '...';
        }
      } else {
        // Fallback to township if address is empty
        addressName = dto.township;
      }
    }

    const result = await this.db
      .insert(schema.addresses)
      .values({
        ...dto,
        name: addressName,
        userId,
      })
      .returning();

    return result[0];
  }

  async getUserAddresses(userId: number) {
    const addresses = await this.db
      .select()
      .from(schema.addresses)
      .where(eq(schema.addresses.userId, userId))
      .orderBy(asc(schema.addresses.createdAt));

    return addresses;
  }

  async getAddressById(addressId: number) {
    const results = await this.db
      .select()
      .from(schema.addresses)
      .where(eq(schema.addresses.id, addressId))
      .limit(1);

    return results[0] || null;
  }

  async updateAddress(addressId: number, userId: number, dto: Partial<AddressDto>) {
    // Verify address belongs to user
    const address = await this.getAddressById(addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    if (address.userId !== userId) {
      throw new ForbiddenException('You can only update your own addresses');
    }

    const result = await this.db
      .update(schema.addresses)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(schema.addresses.id, addressId))
      .returning();

    return result[0];
  }

  async deleteAddress(addressId: number, userId: number) {
    // Verify address belongs to user
    const address = await this.getAddressById(addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    if (address.userId !== userId) {
      throw new ForbiddenException('You can only delete your own addresses');
    }

    // Check if this is the primary address
    const user = await this.getUserById(userId);
    if (user && user.primaryAddressId === addressId) {
      // If deleting primary address, set primaryAddressId to null or first available address
      const remainingAddresses = await this.db
        .select()
        .from(schema.addresses)
        .where(
          and(
            eq(schema.addresses.userId, userId),
            sql`${schema.addresses.id} != ${addressId}`,
          ),
        )
        .limit(1);

      const newPrimaryAddressId = remainingAddresses[0]?.id || null;

      await this.db
        .update(schema.users)
        .set({ primaryAddressId: newPrimaryAddressId, updatedAt: new Date() })
        .where(eq(schema.users.id, userId));
    }

    await this.db.delete(schema.addresses).where(eq(schema.addresses.id, addressId));

    return { message: 'Address deleted successfully' };
  }

  async setPrimaryAddress(userId: number, addressId: number) {
    // Verify address belongs to user
    const address = await this.getAddressById(addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }
    if (address.userId !== userId) {
      throw new ForbiddenException('You can only set your own addresses as primary');
    }

    await this.db
      .update(schema.users)
      .set({ primaryAddressId: addressId, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));

    return this.getAddressById(addressId);
  }

  async updateUser(id: number, data: UpdateUserDto) {
    const result = await this.db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();

    // Fetch updated user with address
    if (result[0]) {
      return this.getUserById(id);
    }

    return null;
  }

  async deleteUser(id: number) {
    // Get user before deleting
    const user = await this.getUserById(id);
    
    // If user is a technician, delete all their timeslots
    if (user && user.role === 'technician') {
      try {
        await this.timeslotsService.deleteTechnicianTimeslots(id);
      } catch (error) {
        // Log error but continue with user deletion
        console.error(`Failed to delete timeslots for technician ${id}:`, error);
      }
    }
    
    // Delete user - addresses will be cascade deleted due to foreign key constraint
    await this.db.delete(schema.users).where(eq(schema.users.id, id));

    return user;
  }

  /**
   * Calculate average rating for a technician based on all feedbacks received
   * for bookings/services they have completed
   */
  async getTechnicianAverageRating(technicianId: number) {
    // First verify the user exists and is a technician
    const user = await this.getUserById(technicianId);
    if (!user) {
      throw new NotFoundException(`User with ID ${technicianId} not found`);
    }
    if (user.role !== 'technician') {
      throw new NotFoundException(`User with ID ${technicianId} is not a technician`);
    }

    // Calculate average rating by joining bookings with feedbacks
    // Only count feedbacks that exist (inner join ensures we only get bookings with feedbacks)
    const result = await this.db
      .select({
        averageRating: sql<number>`COALESCE(AVG(${schema.feedbacks.rating})::numeric, 0)`,
        totalFeedbacks: sql<number>`COUNT(${schema.feedbacks.id})::int`,
      })
      .from(schema.bookings)
      .innerJoin(schema.feedbacks, eq(schema.feedbacks.bookingId, schema.bookings.id))
      .where(eq(schema.bookings.technicianId, technicianId));

    // If no feedbacks exist, result will be empty array
    const avgRating = result[0]?.averageRating ? parseFloat(result[0].averageRating.toString()) : 0;
    const totalFeedbacks = result[0]?.totalFeedbacks || 0;

    return {
      technicianId,
      averageRating: avgRating,
      totalFeedbacks,
      // Round to 2 decimal places for display
      averageRatingRounded: Math.round(avgRating * 100) / 100,
    };
  }

  /**
   * Get average ratings for all technicians (admin only)
   */
  async getAllTechnicianRatings() {
    // Get all technicians
    const technicians = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role, 'technician'));

    // Calculate average rating for each technician
    const ratings = await Promise.all(
      technicians.map(async (technician) => {
        const result = await this.db
          .select({
            averageRating: sql<number>`COALESCE(AVG(${schema.feedbacks.rating})::numeric, 0)`,
            totalFeedbacks: sql<number>`COUNT(${schema.feedbacks.id})::int`,
          })
          .from(schema.bookings)
          .innerJoin(schema.feedbacks, eq(schema.feedbacks.bookingId, schema.bookings.id))
          .where(eq(schema.bookings.technicianId, technician.id));

        const avgRating = result[0]?.averageRating
          ? parseFloat(result[0].averageRating.toString())
          : 0;
        const totalFeedbacks = result[0]?.totalFeedbacks || 0;

        return {
          technicianId: technician.id,
          technicianName: technician.name,
          averageRating: avgRating,
          averageRatingRounded: Math.round(avgRating * 100) / 100,
          totalFeedbacks,
        };
      }),
    );

    return ratings;
  }
}
