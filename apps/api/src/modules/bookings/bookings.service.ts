import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and, sql, desc, inArray } from 'drizzle-orm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class BookingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new booking with automatic technician assignment
   */
  async create(
    customerId: number,
    createBookingDto: CreateBookingDto,
    imageFiles?: Express.Multer.File[],
  ) {
    const { airconId, serviceIds, bookingForDate, bookingTime, description, addressId } = createBookingDto;

    // 1. Verify customer owns the aircon
    const aircon = await db.query.customerProducts.findFirst({
      where: eq(schema.customerProducts.id, airconId),
      with: {
        customer: {
          with: {
            primaryAddress: true,
          },
        },
        product: true,
      },
    });

    if (!aircon) {
      throw new NotFoundException(`Aircon with ID ${airconId} not found`);
    }

    if (aircon.customerId !== customerId) {
      throw new ForbiddenException('You can only book services for your own aircons');
    }

    // 2. Determine which address to use for district check and store it for the response
    let customerDistrict: string;
    let serviceAddress: any = null; // Track which address was used for the service

    if (addressId) {
      // If addressId is provided, fetch and validate that address
      const selectedAddress = await db.query.addresses.findFirst({
        where: eq(schema.addresses.id, addressId),
      });

      if (!selectedAddress) {
        throw new NotFoundException(`Address with ID ${addressId} not found`);
      }

      if (selectedAddress.userId !== customerId) {
        throw new ForbiddenException('You can only use your own addresses for booking');
      }

      customerDistrict = selectedAddress.district;
      // Store the complete selected address object for the response
      serviceAddress = {
        id: selectedAddress.id,
        userId: selectedAddress.userId,
        name: selectedAddress.name,
        address: selectedAddress.address,
        township: selectedAddress.township,
        city: selectedAddress.city,
        district: selectedAddress.district,
        createdAt: selectedAddress.createdAt,
        updatedAt: selectedAddress.updatedAt,
      };
    } else {
      // If no addressId provided, use primary address
      const primaryAddress = (aircon.customer as any)?.primaryAddress;
      if (!primaryAddress) {
        throw new BadRequestException(
          'Customer address is required for booking. Please update your profile or provide an addressId.',
        );
      }

      customerDistrict = primaryAddress.district;
      // Store the complete primary address object for the response
      serviceAddress = {
        id: primaryAddress.id,
        userId: primaryAddress.userId,
        name: primaryAddress.name,
        address: primaryAddress.address,
        township: primaryAddress.township,
        city: primaryAddress.city,
        district: primaryAddress.district,
        createdAt: primaryAddress.createdAt,
        updatedAt: primaryAddress.updatedAt,
      };
    }

    // 3. Verify all services exist and calculate duration + fees
    const services = await db.query.serviceTypes.findMany({
      where: inArray(schema.serviceTypes.id, serviceIds),
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException('One or more service IDs are invalid');
    }

    // Calculate service duration (in minutes) without extra traffic time
    const serviceDuration = services.reduce((sum, service) => sum + service.duration, 0);

    // Calculate total fees (sum of all service fees)
    const totalFees = services.reduce((sum, service) => sum + parseFloat(service.serviceFee), 0);

    // Calculate required hours for actual service (round up)
    const serviceHours = Math.ceil(serviceDuration / 60);

    // 4. Validate booking date and time
    // Get current time in Bangkok timezone (UTC+7)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const bangkokNow = new Date(
      parseInt(parts.find(p => p.type === 'year')!.value),
      parseInt(parts.find(p => p.type === 'month')!.value) - 1,
      parseInt(parts.find(p => p.type === 'day')!.value),
      parseInt(parts.find(p => p.type === 'hour')!.value),
      parseInt(parts.find(p => p.type === 'minute')!.value),
      parseInt(parts.find(p => p.type === 'second')!.value),
    );
    
    // Get today's date in Bangkok timezone (set to midnight)
    const today = new Date(bangkokNow);
    today.setHours(0, 0, 0, 0);
    
    const bookingDate = new Date(bookingForDate);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new BadRequestException('Cannot book for past dates');
    }

    // Check if booking date is within 30 days
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    if (bookingDate > maxDate) {
      throw new BadRequestException('Cannot book more than 30 days in advance');
    }

    // Validate booking time (must be between 9-16)
    if (bookingTime < 9 || bookingTime > 16) {
      throw new BadRequestException('Booking time must be between 9 and 16');
    }

    // If booking is for today, check if the booking time has already passed
    if (bookingDate.getTime() === today.getTime()) {
      const currentHour = bangkokNow.getHours();
      const currentMinute = bangkokNow.getMinutes();
      // Reject if booking time is less than or equal to current hour
      // (if it's 9:00 or later, the 9:00 slot has already started)
      if (bookingTime <= currentHour) {
        throw new BadRequestException(
          `Cannot book for ${bookingTime}:00 as this time has already passed. Current time in Bangkok is ${currentHour}:${currentMinute.toString().padStart(2, '0')}`,
        );
      }
    }

    // Check if service would extend beyond working hours (5 PM)
    const serviceEndTime = bookingTime + serviceHours;
    if (serviceEndTime > 17) {
      throw new BadRequestException(
        `Service duration (${serviceHours} hours) extends beyond working hours (5 PM). Please choose an earlier time.`,
      );
    }

    // Add 1 hour for traffic only if there are available slots after the booking
    const hasSlotForTraffic = serviceEndTime < 17;
    const totalDuration = hasSlotForTraffic ? serviceDuration + 60 : serviceDuration;
    const requiredHours = Math.ceil(totalDuration / 60);

    // 5. Find available technician
    const assignedTechnicianId = await this.findAvailableTechnician(
      serviceIds,
      customerDistrict,
      bookingForDate,
      bookingTime,
      requiredHours,
    );

    if (!assignedTechnicianId) {
      throw new BadRequestException(
        'No available technician found for the selected date, time, and services. Please try a different time slot.',
      );
    }

    // 6. Create booking
    const bookingOnDate = new Date().toISOString().split('T')[0];
    const bookingTimeStr = `${bookingTime.toString().padStart(2, '0')}:00:00`;

    const [newBooking] = await db
      .insert(schema.bookings)
      .values({
        technicianId: assignedTechnicianId,
        airconId,
        bookingOnDate,
        bookingForDate,
        bookingTime: bookingTimeStr,
        duration: totalDuration,
        fees: totalFees.toString(),
        status: 'pending',
        description: description || null,
      })
      .returning();

    // 7. Link services to booking
    const bookingServiceRecords = serviceIds.map((serviceId) => ({
      bookingId: newBooking.id,
      serviceId,
    }));
    await db.insert(schema.bookingServices).values(bookingServiceRecords);

    // 8. Update technician's timeslots (remove booked hours)
    await this.updateTimeslots(assignedTechnicianId, bookingForDate, bookingTime, requiredHours);

    // 9. Upload images if provided
    if (imageFiles && imageFiles.length > 0) {
      const imageUrls = await this.uploadBookingImages(newBooking.id, imageFiles);

      const imageRecords = imageUrls.map((url) => ({
        bookingId: newBooking.id,
        url,
      }));

      await db.insert(schema.bookingImages).values(imageRecords);
    }

    // 10. Return complete booking details with the address used for service
    const bookingDetails = await this.findOne(newBooking.id, customerId, 'customer');
    
    // Ensure serviceAddress is set (it should always be set at this point, but add fallback for safety)
    if (!serviceAddress) {
      // Fallback: use primary address if serviceAddress wasn't set (shouldn't happen)
      const primaryAddress = (bookingDetails.aircon as any)?.customer?.primaryAddress;
      if (primaryAddress) {
        serviceAddress = {
          id: primaryAddress.id,
          userId: primaryAddress.userId,
          name: primaryAddress.name,
          address: primaryAddress.address,
          township: primaryAddress.township,
          city: primaryAddress.city,
          district: primaryAddress.district,
          createdAt: primaryAddress.createdAt,
          updatedAt: primaryAddress.updatedAt,
        };
      }
    }
    
    // Return booking with serviceAddress included
    // serviceAddress contains the address that was used for this booking:
    // - If addressId was provided in the request, it's the selected address
    // - If addressId was not provided, it's the customer's primary address
    return {
      ...(bookingDetails as any),
      serviceAddress,
    };
  }

  /**
   * Find an available technician for the booking
   * Returns technician ID or null if none available
   * If multiple technicians match all criteria, randomly picks one
   */
  private async findAvailableTechnician(
    serviceIds: number[],
    customerDistrict: string,
    bookingDate: string,
    startHour: number,
    requiredHours: number,
  ): Promise<number | null> {
    // Get all technicians from the same district
    const technicians = await db.query.users.findMany({
      where: eq(schema.users.role, 'technician'),
      with: {
        primaryAddress: true,
        technicianServices: {
          with: {
            service: true,
          },
        },
      },
    });

    // Filter by district
    const techsInDistrict = technicians.filter(
      (tech) => tech.primaryAddress?.district === customerDistrict,
    );

    if (techsInDistrict.length === 0) {
      return null;
    }

    // Filter technicians that have all required services
    const techsWithServices = techsInDistrict.filter((tech) => {
      const techServiceIds = tech.technicianServices.map((ts: any) => ts.serviceId);
      return serviceIds.every((serviceId) => techServiceIds.includes(serviceId));
    });

    if (techsWithServices.length === 0) {
      return null;
    }

    // Check availability for all technicians with matching services
    // Use Promise.all to check all technicians in parallel for better performance
    const availabilityChecks = await Promise.all(
      techsWithServices.map(async (tech) => {
        const hasAvailability = await this.checkTechnicianAvailability(
          tech.id,
          bookingDate,
          startHour,
          requiredHours,
        );
        return { tech, hasAvailability };
      }),
    );

    // Filter to only technicians with availability
    const availableTechnicians = availabilityChecks
      .filter((check) => check.hasAvailability)
      .map((check) => check.tech);

    if (availableTechnicians.length === 0) {
      return null;
    }

    // If multiple technicians match all criteria, randomly pick one
    if (availableTechnicians.length === 1) {
      return availableTechnicians[0].id;
    }

    // Randomly select one technician from the available ones
    const shuffled = this.shuffleArray([...availableTechnicians]);
    return shuffled[0].id;
  }

  /**
   * Check if a technician has continuous available hours
   */
  private async checkTechnicianAvailability(
    technicianId: number,
    date: string,
    startHour: number,
    requiredHours: number,
  ): Promise<boolean> {
    const timeslot = await db.query.timeslots.findFirst({
      where: and(eq(schema.timeslots.technicianId, technicianId), eq(schema.timeslots.date, date)),
    });

    if (!timeslot || !timeslot.slots) {
      return false;
    }

    // Check if all required hours are available
    const requiredSlots = Array.from({ length: requiredHours }, (_, i) => startHour + i);

    return requiredSlots.every((hour) => timeslot.slots.includes(hour));
  }

  /**
   * Update technician's timeslots by removing booked hours
   */
  private async updateTimeslots(
    technicianId: number,
    date: string,
    startHour: number,
    requiredHours: number,
  ): Promise<void> {
    const timeslot = await db.query.timeslots.findFirst({
      where: and(eq(schema.timeslots.technicianId, technicianId), eq(schema.timeslots.date, date)),
    });

    if (!timeslot) {
      throw new BadRequestException('Timeslot not found');
    }

    // Remove booked hours from available slots
    const hoursToRemove = Array.from({ length: requiredHours }, (_, i) => startHour + i);

    const updatedSlots = timeslot.slots.filter((slot) => !hoursToRemove.includes(slot));

    await db
      .update(schema.timeslots)
      .set({
        slots: updatedSlots,
        updatedAt: new Date(),
      })
      .where(eq(schema.timeslots.id, timeslot.id));
  }

  /**
   * Shuffle array for random technician selection
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Find all bookings with pagination and filters
   */
  async findAll(userId: number, userRole: string, query: QueryBookingsDto) {
    const {
      page = 1,
      limit = 10,
      customerId,
      technicianId,
      airconId,
      status,
      bookingForDate,
    } = query;
    const offset = (page - 1) * limit;

    // Build where conditions based on role
    const conditions = [];

    if (userRole === 'customer') {
      // Customers can only see their own bookings
      const customerAircons = await db.query.customerProducts.findMany({
        where: eq(schema.customerProducts.customerId, userId),
      });
      const airconIds = customerAircons.map((a) => a.id);
      if (airconIds.length > 0) {
        conditions.push(inArray(schema.bookings.airconId, airconIds));
      } else {
        // Customer has no aircons, return empty
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }
    } else if (userRole === 'technician') {
      // Technicians can only see their assigned bookings
      conditions.push(eq(schema.bookings.technicianId, userId));
    } else if (userRole === 'admin') {
      // Admins can filter by customer or technician
      if (customerId) {
        const customerAircons = await db.query.customerProducts.findMany({
          where: eq(schema.customerProducts.customerId, customerId),
        });
        const airconIds = customerAircons.map((a) => a.id);
        if (airconIds.length > 0) {
          conditions.push(inArray(schema.bookings.airconId, airconIds));
        }
      }
      if (technicianId) {
        conditions.push(eq(schema.bookings.technicianId, technicianId));
      }
    }

    // Additional filters
    if (airconId) {
      conditions.push(eq(schema.bookings.airconId, airconId));
    }
    if (status) {
      conditions.push(eq(schema.bookings.status, status));
    }
    if (bookingForDate) {
      conditions.push(eq(schema.bookings.bookingForDate, bookingForDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.bookings)
      .where(whereClause);

    // Get bookings with relations
    const bookings = await db.query.bookings.findMany({
      where: whereClause,
      with: {
        technician: {
          with: {
            primaryAddress: true,
          },
        },
        aircon: {
          with: {
            customer: true,
            product: true,
          },
        },
        bookingServices: {
          with: {
            service: true,
          },
        },
        bookingImages: true,
        serviceLog: true,
        feedback: true,
      },
      limit,
      offset,
      orderBy: [desc(schema.bookings.createdAt)],
    });

    return {
      data: bookings,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Find a single booking by ID
   */
  async findOne(id: number, userId: number, userRole: string) {
    const booking = await db.query.bookings.findFirst({
      where: eq(schema.bookings.id, id),
      with: {
        technician: {
          with: {
            primaryAddress: true,
          },
        },
        aircon: {
          with: {
            customer: {
              with: {
                primaryAddress: true,
              },
            },
            product: true,
          },
        },
        bookingServices: {
          with: {
            service: true,
          },
        },
        bookingImages: true,
        serviceLog: true,
        feedback: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Authorization check
    if (userRole === 'customer') {
      if ((booking.aircon as any).customerId !== userId) {
        throw new ForbiddenException('You can only view your own bookings');
      }
    } else if (userRole === 'technician') {
      if ((booking as any).technicianId !== userId) {
        throw new ForbiddenException('You can only view your assigned bookings');
      }
    }
    // Admins can view any booking

    return booking;
  }

  /**
   * Update a booking (status, description, fees)
   */
  async update(id: number, userId: number, userRole: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id, userId, userRole);

    // Only technicians and admins can update bookings
    if (userRole === 'customer') {
      throw new ForbiddenException('Customers cannot update bookings');
    }

    if (userRole === 'technician' && (booking as any).technicianId !== userId) {
      throw new ForbiddenException('You can only update your assigned bookings');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updateBookingDto.status) {
      updateData.status = updateBookingDto.status;
    }

    if (updateBookingDto.description !== undefined) {
      updateData.description = updateBookingDto.description;
    }

    if (updateBookingDto.fees !== undefined) {
      updateData.fees = updateBookingDto.fees.toString();
    }

    await db.update(schema.bookings).set(updateData).where(eq(schema.bookings.id, id));

    return this.findOne(id, userId, userRole);
  }

  /**
   * Delete a booking (admin only, or customer if still pending)
   */
  async remove(id: number, userId: number, userRole: string) {
    const booking = await this.findOne(id, userId, userRole);

    // Only admins or customers can delete bookings
    if (userRole === 'technician') {
      throw new ForbiddenException('Technicians cannot delete bookings');
    }

    // Customers can only delete their own pending bookings
    if (userRole === 'customer') {
      if ((booking.aircon as any).customerId !== userId) {
        throw new ForbiddenException('You can only delete your own bookings');
      }
      if (booking.status !== 'pending') {
        throw new ForbiddenException('You can only delete pending bookings');
      }
    }

    // Delete booking images from storage
    if (booking.bookingImages && booking.bookingImages.length > 0) {
      const imagePaths = booking.bookingImages.map((img) =>
        this.supabaseService.extractPathFromUrl(img.url, 'booking-images'),
      );
      await this.supabaseService.deleteFiles('booking-images', imagePaths);
    }

    // If booking is pending, restore the timeslots
    if (booking.status === 'pending') {
      await this.restoreTimeslots(booking);
    }

    // Delete booking (cascade will delete related records)
    await db.delete(schema.bookings).where(eq(schema.bookings.id, id));

    return { message: 'Booking deleted successfully' };
  }

  /**
   * Restore timeslots when a pending booking is cancelled
   */
  private async restoreTimeslots(booking: any): Promise<void> {
    const timeslot = await db.query.timeslots.findFirst({
      where: and(
        eq(schema.timeslots.technicianId, (booking as any).technicianId),
        eq(schema.timeslots.date, booking.bookingForDate),
      ),
    });

    if (!timeslot) {
      return; // Timeslot might have been deleted if past
    }

    // Calculate hours that were booked
    const startHour = parseInt(booking.bookingTime.split(':')[0]);
    const requiredHours = Math.ceil(booking.duration / 60);
    const hoursToRestore = Array.from({ length: requiredHours }, (_, i) => startHour + i);

    // Add back the hours (ensure no duplicates and keep sorted)
    const restoredSlots = [...new Set([...timeslot.slots, ...hoursToRestore])].sort(
      (a, b) => a - b,
    );

    await db
      .update(schema.timeslots)
      .set({
        slots: restoredSlots,
        updatedAt: new Date(),
      })
      .where(eq(schema.timeslots.id, timeslot.id));
  }

  /**
   * Delete a specific booking image (technician or admin)
   */
  async removeImage(bookingId: number, imageId: number, userId: number, userRole: string) {
    const booking = await this.findOne(bookingId, userId, userRole);

    // Only technicians assigned to the booking or admins can delete images
    if (userRole === 'customer') {
      throw new ForbiddenException('Customers cannot delete booking images');
    }

    if (userRole === 'technician' && (booking as any).technicianId !== userId) {
      throw new ForbiddenException('You can only delete images from your assigned bookings');
    }

    // Find the image
    const [image] = await db
      .select()
      .from(schema.bookingImages)
      .where(
        and(eq(schema.bookingImages.id, imageId), eq(schema.bookingImages.bookingId, bookingId)),
      );

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found for booking ${bookingId}`);
    }

    // Delete from storage
    const imagePath = this.supabaseService.extractPathFromUrl(image.url, 'booking-images');
    await this.supabaseService.deleteFile('booking-images', imagePath);

    // Delete from database
    await db.delete(schema.bookingImages).where(eq(schema.bookingImages.id, imageId));

    return { message: 'Image deleted successfully' };
  }

  /**
   * Get available timeslots per day for the next 30 days
   * Returns an array of dates with available time slots where at least one technician
   * from the same district can perform all selected services
   */
  async getAvailability(customerId: number, query: AvailabilityQueryDto) {
    const { airconId, serviceIds, addressId, date } = query;

    // 1. Verify customer owns the aircon
    const aircon = await db.query.customerProducts.findFirst({
      where: eq(schema.customerProducts.id, airconId),
      with: {
        customer: {
          with: {
            primaryAddress: true,
          },
        },
      },
    });

    if (!aircon) {
      throw new NotFoundException(`Aircon with ID ${airconId} not found`);
    }

    if (aircon.customerId !== customerId) {
      throw new ForbiddenException('You can only check availability for your own aircons');
    }

    // 2. Determine which address to use for district check
    let customerDistrict: string;

    if (addressId) {
      // If addressId is provided, fetch and validate that address
      const selectedAddress = await db.query.addresses.findFirst({
        where: eq(schema.addresses.id, addressId),
      });

      if (!selectedAddress) {
        throw new NotFoundException(`Address with ID ${addressId} not found`);
      }

      if (selectedAddress.userId !== customerId) {
        throw new ForbiddenException('You can only use your own addresses for booking');
      }

      customerDistrict = selectedAddress.district;
    } else {
      // If no addressId provided, use primary address
      if (!(aircon.customer as any)?.primaryAddress) {
        throw new BadRequestException(
          'Customer address is required for checking availability. Please update your profile or provide an addressId.',
        );
      }

      customerDistrict = (aircon.customer as any).primaryAddress.district;
    }

    // 3. Verify all services exist and calculate duration
    const services = await db.query.serviceTypes.findMany({
      where: inArray(schema.serviceTypes.id, serviceIds),
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException('One or more service IDs are invalid');
    }

    // Calculate service duration (in minutes)
    const serviceDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const serviceHours = Math.ceil(serviceDuration / 60);

    // 4. Find all technicians from the same district who have all required services
    const technicians = await db.query.users.findMany({
      where: eq(schema.users.role, 'technician'),
      with: {
        primaryAddress: true,
        technicianServices: {
          with: {
            service: true,
          },
        },
      },
    });

    // Filter by district
    const techsInDistrict = technicians.filter(
      (tech) => tech.primaryAddress?.district === customerDistrict,
    );

    if (techsInDistrict.length === 0) {
      // No technicians in district, return empty availability
      return this.generateEmptyAvailability(date);
    }

    // Filter technicians that have all required services
    const techsWithServices = techsInDistrict.filter((tech) => {
      const techServiceIds = tech.technicianServices.map((ts: any) => ts.serviceId);
      return serviceIds.every((serviceId) => techServiceIds.includes(serviceId));
    });

    if (techsWithServices.length === 0) {
      // No technicians with required services, return empty availability
      return this.generateEmptyAvailability(date);
    }

    const technicianIds = techsWithServices.map((tech) => tech.id);

    // 5. Get current time in Bangkok timezone (UTC+7)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const bangkokNow = new Date(
      parseInt(parts.find(p => p.type === 'year')!.value),
      parseInt(parts.find(p => p.type === 'month')!.value) - 1,
      parseInt(parts.find(p => p.type === 'day')!.value),
      parseInt(parts.find(p => p.type === 'hour')!.value),
      parseInt(parts.find(p => p.type === 'minute')!.value),
      parseInt(parts.find(p => p.type === 'second')!.value),
    );
    
    // Get today's date in Bangkok timezone (set to midnight)
    const today = new Date(bangkokNow);
    today.setHours(0, 0, 0, 0);
    
    const currentHour = bangkokNow.getHours();
    const currentMinute = bangkokNow.getMinutes();

    // Format today's date string in Bangkok timezone for comparison
    // Build the date string directly from formatted parts to avoid timezone conversion issues
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    // Get the date parts directly from Bangkok timezone to build today's date string
    const bangkokDateParts = formatter.formatToParts(now);
    const year = bangkokDateParts.find(p => p.type === 'year')!.value;
    const month = bangkokDateParts.find(p => p.type === 'month')!.value;
    const day = bangkokDateParts.find(p => p.type === 'day')!.value;
    const finalTodayDateStr = `${year}-${month}-${day}`;

    // If a specific date is provided, return only that date's availability
    if (date) {
      // Normalize and validate the date format (YYYY-MM-DD)
      const normalizedDate = date.trim();
      const dateParts = normalizedDate.split('-');
      if (dateParts.length !== 3 || dateParts[0].length !== 4 || dateParts[1].length !== 2 || dateParts[2].length !== 2) {
        throw new BadRequestException('Invalid date format. Expected YYYY-MM-DD');
      }
      
      // The input is already in YYYY-MM-DD format, use it directly for comparison
      const requestedDateStr = normalizedDate;
      
      // Compare date strings directly (YYYY-MM-DD format) - this avoids timezone conversion issues
      // Only reject if the requested date is strictly before today
      if (requestedDateStr < finalTodayDateStr) {
        throw new BadRequestException('Cannot check availability for past dates');
      }

      // Check if date is within 30 days - format maxDate in Bangkok timezone for comparison
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 30);
      const maxDateStr = dateFormatter.format(maxDate);
      if (requestedDateStr > maxDateStr) {
        throw new BadRequestException('Cannot check availability more than 30 days in advance');
      }
      const isToday = requestedDateStr === finalTodayDateStr;

      // Get availability for the requested date
      const dayAvailability = await this.getAvailabilityForDate(
        technicianIds,
        requestedDateStr,
        serviceHours,
        isToday,
        currentHour,
      );

      return [
        {
          date: requestedDateStr,
          availableSlots: dayAvailability,
        },
      ];
    }

    // Otherwise, return availability for next 30 days
    const availability: Array<{ date: string; availableSlots: number[] }> = [];

    // Loop for 30 days starting from today (includes today + next 29 days = 30 days total)
    // But we want to include the 30th day from today, so we need 31 iterations (0-30)
    for (let i = 0; i <= 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      // Format date string in Bangkok timezone (YYYY-MM-DD)
      const dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const dateStr = dateFormatter.format(checkDate);

      // Check if this is today's date by comparing date strings
      const isToday = dateStr === finalTodayDateStr;

      // Get availability for this date
      const dayAvailability = await this.getAvailabilityForDate(
        technicianIds,
        dateStr,
        serviceHours,
        isToday,
        currentHour,
      );

      availability.push({
        date: dateStr,
        availableSlots: dayAvailability,
      });
    }

    return availability;
  }

  /**
   * Get availability for a specific date
   */
  private async getAvailabilityForDate(
    technicianIds: number[],
    dateStr: string,
    serviceHours: number,
    isToday: boolean,
    currentHour: number,
  ): Promise<number[]> {
    // Get timeslots for all matching technicians for this date
    const timeslots = await db.query.timeslots.findMany({
      where: and(
        inArray(schema.timeslots.technicianId, technicianIds),
        eq(schema.timeslots.date, dateStr),
      ),
    });

    // Find available hours (9-16) where at least one technician can handle the booking
    const availableSlots: number[] = [];

    for (let hour = 9; hour <= 16; hour++) {
      // If booking is for today, check if the booking time has already passed
      if (isToday && hour <= currentHour) {
        continue; // Skip past hours for today
      }

      // Check if service would extend beyond working hours (5 PM)
      const serviceEndTime = hour + serviceHours;
      if (serviceEndTime > 17) {
        continue; // Skip this hour as it extends beyond 5 PM
      }

      // Calculate required hours (including traffic time if applicable)
      const hasSlotForTraffic = serviceEndTime < 17;
      const requiredHours = hasSlotForTraffic ? serviceHours + 1 : serviceHours;

      // Check if at least one technician has availability starting at this hour
      const hasAvailability = timeslots.some((timeslot) => {
        if (!timeslot.slots || timeslot.slots.length === 0) {
          return false;
        }

        // Check if all required consecutive hours are available
        const requiredSlots = Array.from({ length: requiredHours }, (_, i) => hour + i);
        return requiredSlots.every((slot) => timeslot.slots.includes(slot));
      });

      if (hasAvailability) {
        availableSlots.push(hour);
      }
    }

    return availableSlots;
  }

  /**
   * Generate empty availability (when no technicians match criteria)
   * If date is provided, returns single date; otherwise returns 30 days
   */
  private generateEmptyAvailability(date?: string): Array<{ date: string; availableSlots: number[] }> {
    // If a specific date is provided, return only that date
    if (date) {
      return [
        {
          date,
          availableSlots: [],
        },
      ];
    }

    // Otherwise, return empty availability for next 30 days
    // Get current time in Bangkok timezone (UTC+7)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const bangkokNow = new Date(
      parseInt(parts.find(p => p.type === 'year')!.value),
      parseInt(parts.find(p => p.type === 'month')!.value) - 1,
      parseInt(parts.find(p => p.type === 'day')!.value),
      parseInt(parts.find(p => p.type === 'hour')!.value),
      parseInt(parts.find(p => p.type === 'minute')!.value),
      parseInt(parts.find(p => p.type === 'second')!.value),
    );
    
    // Get today's date in Bangkok timezone (set to midnight)
    const today = new Date(bangkokNow);
    today.setHours(0, 0, 0, 0);

    const availability: Array<{ date: string; availableSlots: number[] }> = [];

    // Loop for 30 days starting from today (includes today + next 29 days = 30 days total)
    // But we want to include the 30th day from today, so we need 31 iterations (0-30)
    for (let i = 0; i <= 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      // Format date string in Bangkok timezone (YYYY-MM-DD)
      const dateFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const dateStr = dateFormatter.format(checkDate);

      availability.push({
        date: dateStr,
        availableSlots: [],
      });
    }

    return availability;
  }

  /**
   * Upload booking images to Supabase Storage
   */
  private async uploadBookingImages(
    bookingId: number,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = file.originalname.split('.').pop();
      const filename = `booking-${bookingId}-${timestamp}-${randomString}.${extension}`;
      const path = `bookings/${bookingId}/${filename}`;

      return this.supabaseService.uploadFile('booking-images', path, file.buffer, file.mimetype);
    });

    return Promise.all(uploadPromises);
  }
}
