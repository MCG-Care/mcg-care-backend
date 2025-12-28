import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DB_PROVIDER } from '../../config/database.module';
import { db, Database } from '../../config/database';
import { schema } from '../../config/database';
import * as bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/address.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DB_PROVIDER) private readonly db: Database) {}

  async getAllUsers() {
    const results = await this.db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        phoneNo: schema.users.phoneNo,
        role: schema.users.role,
        addressId: schema.users.addressId,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        address: {
          id: schema.addresses.id,
          address: schema.addresses.address,
          township: schema.addresses.township,
          city: schema.addresses.city,
          district: schema.addresses.district,
          createdAt: schema.addresses.createdAt,
          updatedAt: schema.addresses.updatedAt,
        },
      })
      .from(schema.users)
      .leftJoin(schema.addresses, eq(schema.users.addressId, schema.addresses.id));

    // Transform results to match expected format
    return results.map((result) => {
      const { address, ...user } = result;
      return {
        ...user,
        address: address && address.id ? address : null,
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
        addressId: schema.users.addressId,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        address: {
          id: schema.addresses.id,
          address: schema.addresses.address,
          township: schema.addresses.township,
          city: schema.addresses.city,
          district: schema.addresses.district,
          createdAt: schema.addresses.createdAt,
          updatedAt: schema.addresses.updatedAt,
        },
      })
      .from(schema.users)
      .leftJoin(schema.addresses, eq(schema.users.addressId, schema.addresses.id))
      .where(eq(schema.users.id, id))
      .limit(1);

    const result = results[0] || null;
    if (!result) return null;

    // Transform result to match expected format
    const { address, ...user } = result;
    const userWithAddress = {
      ...user,
      address: address && address.id ? address : null,
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
        addressId: schema.users.addressId,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
        address: {
          id: schema.addresses.id,
          address: schema.addresses.address,
          township: schema.addresses.township,
          city: schema.addresses.city,
          district: schema.addresses.district,
          createdAt: schema.addresses.createdAt,
          updatedAt: schema.addresses.updatedAt,
        },
      })
      .from(schema.users)
      .leftJoin(schema.addresses, eq(schema.users.addressId, schema.addresses.id))
      .where(eq(schema.users.email, email))
      .limit(1);

    const result = results[0] || null;
    if (!result) return null;

    // Transform result to match expected format
    const { address, ...user } = result;
    return {
      ...user,
      address: address && address.id ? address : null,
    };
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phoneNo: string;
    role: 'customer' | 'technician' | 'admin';
    addressId: number;
  }) {
    const result = await this.db.insert(schema.users).values(data).returning();
    const user = result[0];

    // Fetch user with address
    if (user) {
      return this.getUserById(user.id);
    }

    return user;
  }

  async createAddress(dto: AddressDto) {
    const result = await this.db.insert(schema.addresses).values(dto).returning();

    return result[0];
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
    // Get user with address before deleting
    const user = await this.getUserById(id);
    
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
