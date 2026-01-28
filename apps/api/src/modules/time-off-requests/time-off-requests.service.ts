import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and, gte, lte } from 'drizzle-orm';
import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';
import { QueryTimeOffRequestsDto } from './dto/query-time-off-requests.dto';
import { ReviewTimeOffRequestDto } from './dto/review-time-off-request.dto';

@Injectable()
export class TimeOffRequestsService {
  /**
   * Get today's date in Bangkok timezone (YYYY-MM-DD format)
   */
  private getLocalDateString(date: Date = new Date()): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  /**
   * Create a new time-off request
   */
  async create(technicianId: number, createDto: CreateTimeOffRequestDto) {
    const { startDate, endDate, startSlot, endSlot, isFullDay, reason } = createDto;

    // Verify technician exists and has technician role
    const technician = await db.query.users.findFirst({
      where: eq(schema.users.id, technicianId),
    });

    if (!technician) {
      throw new NotFoundException(`Technician with ID ${technicianId} not found`);
    }

    if (technician.role !== 'technician') {
      throw new BadRequestException(`User with ID ${technicianId} is not a technician`);
    }

    // Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date must be before or equal to end date');
    }

    // Validate time slots
    if (startSlot > endSlot) {
      throw new BadRequestException('Start slot must be before or equal to end slot');
    }

    // Validate that dates are not in the past
    const today = this.getLocalDateString();
    if (startDate < today) {
      throw new BadRequestException('Cannot request time off for past dates');
    }

    // For full day requests, ensure slots are 9 and 16
    if (isFullDay && (startSlot !== 9 || endSlot !== 16)) {
      throw new BadRequestException('Full day requests must have startSlot=9 and endSlot=16');
    }

    // Create the request
    const [newRequest] = await db
      .insert(schema.timeOffRequests)
      .values({
        technicianId,
        startDate,
        endDate,
        startSlot,
        endSlot,
        isFullDay,
        reason,
        status: 'pending',
      })
      .returning();

    return newRequest;
  }

  /**
   * Find all time-off requests with filters
   */
  async findAll(query: QueryTimeOffRequestsDto) {
    const { technicianId, status, startDate, endDate } = query;

    // Build where conditions
    const conditions = [];

    if (technicianId) {
      conditions.push(eq(schema.timeOffRequests.technicianId, technicianId));
    }

    if (status) {
      conditions.push(eq(schema.timeOffRequests.status, status));
    }

    if (startDate) {
      conditions.push(gte(schema.timeOffRequests.startDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(schema.timeOffRequests.endDate, endDate));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Get requests with technician and reviewer details
    const requests = await db.query.timeOffRequests.findMany({
      where: whereCondition,
      with: {
        technician: {
          columns: {
            id: true,
            name: true,
            email: true,
            phoneNo: true,
          },
        },
        reviewer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (requests, { desc }) => [desc(requests.createdAt)],
    });

    return requests;
  }

  /**
   * Find a single time-off request by ID
   */
  async findOne(id: number) {
    const request = await db.query.timeOffRequests.findFirst({
      where: eq(schema.timeOffRequests.id, id),
      with: {
        technician: {
          columns: {
            id: true,
            name: true,
            email: true,
            phoneNo: true,
          },
        },
        reviewer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Time-off request with ID ${id} not found`);
    }

    return request;
  }

  /**
   * Review a time-off request (approve or reject)
   * If approved, automatically blocks the timeslots
   */
  async review(id: number, reviewerId: number, reviewDto: ReviewTimeOffRequestDto) {
    const { status, reviewNote } = reviewDto;

    // Get the request
    const request = await this.findOne(id);

    // Check if already reviewed
    if (request.status !== 'pending') {
      throw new BadRequestException(`Request has already been ${request.status}`);
    }

    // Verify reviewer is an admin
    const reviewer = await db.query.users.findFirst({
      where: eq(schema.users.id, reviewerId),
    });

    if (!reviewer || reviewer.role !== 'admin') {
      throw new ForbiddenException('Only admins can review time-off requests');
    }

    // If approving, check for existing bookings first
    if (status === 'approved') {
      await this.checkForExistingBookings(request);
    }

    // Update the request
    const [updatedRequest] = await db
      .update(schema.timeOffRequests)
      .set({
        status,
        reviewerId,
        reviewedAt: new Date(),
        reviewNote,
        updatedAt: new Date(),
      })
      .where(eq(schema.timeOffRequests.id, id))
      .returning();

    // If approved, block the timeslots
    if (status === 'approved') {
      await this.blockTimeslots(request);
    }

    return updatedRequest;
  }

  /**
   * Check if there are any existing bookings for the requested timeslots
   * Throws an error if any bookings are found
   */
  private async checkForExistingBookings(request: any) {
    const { technicianId, startDate, endDate, startSlot, endSlot } = request;

    // Generate array of dates in the range
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      dates.push(this.getLocalDateString(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check each date for existing bookings
    for (const date of dates) {
      // Find all bookings for this technician on this date
      const bookings = await db.query.bookings.findMany({
        where: and(
          eq(schema.bookings.technicianId, technicianId),
          eq(schema.bookings.bookingForDate, date),
        ),
      });

      // Check if any booking conflicts with the requested time slots
      for (const booking of bookings) {
        // Extract hour from booking time (format: "HH:MM:SS")
        const bookingHour = parseInt(booking.bookingTime.split(':')[0]);
        
        // Calculate how many hours this booking occupies
        // Note: booking.duration already includes the 1-hour traffic buffer (stored in DB)
        const hoursNeeded = Math.ceil(booking.duration / 60);
        
        // Get all hours occupied by this booking
        const occupiedHours: number[] = [];
        for (let i = 0; i < hoursNeeded; i++) {
          occupiedHours.push(bookingHour + i);
        }

        // Check if any occupied hour conflicts with requested slots
        const requestedSlots: number[] = [];
        for (let slot = startSlot; slot <= endSlot; slot++) {
          requestedSlots.push(slot);
        }

        const conflictingSlots = occupiedHours.filter(hour => requestedSlots.includes(hour));

        if (conflictingSlots.length > 0) {
          throw new BadRequestException(
            `Cannot approve: Existing booking (ID: ${booking.id}) on ${date} conflicts with requested time slots. ` +
            `Booking occupies hours ${occupiedHours.join(', ')}, which overlaps with requested slots ${requestedSlots.join(', ')}.`
          );
        }
      }
    }
  }

  /**
   * Block timeslots for an approved time-off request
   */
  private async blockTimeslots(request: any) {
    const { technicianId, startDate, endDate, startSlot, endSlot } = request;

    // Generate array of dates in the range
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      dates.push(this.getLocalDateString(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate array of slots to remove
    const slotsToRemove: number[] = [];
    for (let slot = startSlot; slot <= endSlot; slot++) {
      slotsToRemove.push(slot);
    }

    // For each date, update the timeslot
    for (const date of dates) {
      // Find the timeslot for this technician and date
      const timeslot = await db.query.timeslots.findFirst({
        where: and(
          eq(schema.timeslots.technicianId, technicianId),
          eq(schema.timeslots.date, date),
        ),
      });

      if (timeslot) {
        // Remove the requested slots
        const currentSlots = timeslot.slots;
        const updatedSlots = currentSlots.filter((slot) => !slotsToRemove.includes(slot));

        // Update the timeslot
        await db
          .update(schema.timeslots)
          .set({
            slots: updatedSlots,
            updatedAt: new Date(),
          })
          .where(eq(schema.timeslots.id, timeslot.id));
      } else {
        // If timeslot doesn't exist yet (e.g., for future dates), we might want to create it
        // with the blocked slots already removed
        const allSlots = [9, 10, 11, 12, 13, 14, 15, 16];
        const availableSlots = allSlots.filter((slot) => !slotsToRemove.includes(slot));

        await db.insert(schema.timeslots).values({
          technicianId,
          date,
          slots: availableSlots,
        });
      }
    }
  }

  /**
   * Delete a time-off request (only if pending)
   */
  async remove(id: number, userId: number, userRole: string) {
    const request = await this.findOne(id);

    // Only the technician who created it can delete it (and only if pending)
    if (userRole !== 'admin' && request.technicianId !== userId) {
      throw new ForbiddenException('You can only delete your own time-off requests');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Cannot delete a request that has been reviewed');
    }

    await db.delete(schema.timeOffRequests).where(eq(schema.timeOffRequests.id, id));

    return { message: 'Time-off request deleted successfully' };
  }
}
