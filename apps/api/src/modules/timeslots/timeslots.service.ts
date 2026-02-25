import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and, gte, lte, lt } from 'drizzle-orm';
import { CreateTimeslotDto } from './dto/create-timeslot.dto';
import { UpdateTimeslotDto } from './dto/update-timeslot.dto';
import { QueryTimeslotsDto } from './dto/query-timeslots.dto';

@Injectable()
export class TimeslotsService {
  private readonly DEFAULT_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16];

  /**
   * Get today's date in Bangkok timezone (YYYY-MM-DD format)
   * This ensures we use Bangkok date, not server's local timezone
   * Cron runs at 17:00 UTC (00:00 Bangkok), so we need Bangkok date
   */
  private getLocalDateString(date: Date = new Date()): string {
    // Convert to Bangkok timezone (UTC+7)
    // Use Intl.DateTimeFormat to get date components in Bangkok timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    // Format returns YYYY-MM-DD directly
    return formatter.format(date);
  }

  /**
   * Create a timeslot for a technician on a specific date
   */
  async create(createTimeslotDto: CreateTimeslotDto) {
    const { technicianId, date, slots } = createTimeslotDto;

    // Check if technician exists and has technician role
    const technician = await db.query.users.findFirst({
      where: eq(schema.users.id, technicianId),
    });

    if (!technician) {
      throw new NotFoundException(`Technician with ID ${technicianId} not found`);
    }

    if (technician.role !== 'technician') {
      throw new BadRequestException(`User with ID ${technicianId} is not a technician`);
    }

    // Check if timeslot already exists for this technician on this date
    const existingTimeslot = await db.query.timeslots.findFirst({
      where: and(eq(schema.timeslots.technicianId, technicianId), eq(schema.timeslots.date, date)),
    });

    if (existingTimeslot) {
      throw new BadRequestException(
        `Timeslot already exists for technician ${technicianId} on ${date}`,
      );
    }

    // Insert timeslot
    const [newTimeslot] = await db
      .insert(schema.timeslots)
      .values({
        technicianId,
        date,
        slots,
      })
      .returning();

    return newTimeslot;
  }

  /**
   * Find timeslots with filters
   */
  async findAll(query: QueryTimeslotsDto) {
    const { technicianId, date, startDate, endDate } = query;

    // Build where conditions
    const conditions = [];

    if (technicianId) {
      conditions.push(eq(schema.timeslots.technicianId, technicianId));
    }

    if (date) {
      conditions.push(eq(schema.timeslots.date, date));
    } else {
      if (startDate) {
        conditions.push(gte(schema.timeslots.date, startDate));
      }
      if (endDate) {
        conditions.push(lte(schema.timeslots.date, endDate));
      }
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // Get timeslots with technician details
    const timeslots = await db.query.timeslots.findMany({
      where: whereCondition,
      with: {
        technician: {
          with: {
            primaryAddress: true,
          },
        },
      },
      orderBy: (timeslots, { asc }) => [asc(timeslots.date), asc(timeslots.technicianId)],
    });

    return timeslots;
  }

  /**
   * Find a single timeslot by ID
   */
  async findOne(id: number) {
    const timeslot = await db.query.timeslots.findFirst({
      where: eq(schema.timeslots.id, id),
      with: {
        technician: {
          with: {
            primaryAddress: true,
          },
        },
      },
    });

    if (!timeslot) {
      throw new NotFoundException(`Timeslot with ID ${id} not found`);
    }

    return timeslot;
  }

  /**
   * Update a timeslot (typically to modify available slots)
   */
  async update(id: number, updateTimeslotDto: UpdateTimeslotDto) {
    // Check if timeslot exists
    await this.findOne(id);

    // Update timeslot
    const [updatedTimeslot] = await db
      .update(schema.timeslots)
      .set({
        slots: updateTimeslotDto.slots,
        updatedAt: new Date(),
      })
      .where(eq(schema.timeslots.id, id))
      .returning();

    return updatedTimeslot;
  }

  /**
   * Delete a timeslot
   */
  async remove(id: number) {
    // Check if timeslot exists
    await this.findOne(id);

    // Delete timeslot
    await db.delete(schema.timeslots).where(eq(schema.timeslots.id, id));

    return { message: 'Timeslot deleted successfully' };
  }

  /**
   * Initialize timeslots for a new technician (31 days: today through today+30)
   */
  async initializeTechnicianTimeslots(technicianId: number) {
    // Check if technician exists (with a retry in case of timing issues)
    let technician = await db.query.users.findFirst({
      where: eq(schema.users.id, technicianId),
    });

    // If not found immediately, wait a bit and retry (in case of transaction timing)
    if (!technician) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      technician = await db.query.users.findFirst({
        where: eq(schema.users.id, technicianId),
      });
    }

    if (!technician) {
      throw new BadRequestException(`Technician with ID ${technicianId} not found`);
    }

    if (technician.role !== 'technician') {
      throw new BadRequestException(`User with ID ${technicianId} is not a technician`);
    }

    const today = new Date();
    const timeslots = [];

    // Create timeslots for next 31 days (today through today+30)
    // We need 31 days so maintenance (which adds today+30) doesn't create a gap:
    // Init creates today+0..today+30; maintenance adds today+30. Without today+30
    // from init, the day before maintenance's new day would be missing (e.g. 23-03).
    for (let i = 0; i < 31; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = this.getLocalDateString(date);

      // Check if timeslot already exists
      const existing = await db.query.timeslots.findFirst({
        where: and(
          eq(schema.timeslots.technicianId, technicianId),
          eq(schema.timeslots.date, dateStr),
        ),
      });

      if (!existing) {
        timeslots.push({
          technicianId,
          date: dateStr,
          slots: [...this.DEFAULT_SLOTS],
        });
      }
    }

    if (timeslots.length > 0) {
      await db.insert(schema.timeslots).values(timeslots);
    }

    return {
      message: `Initialized ${timeslots.length} timeslots for technician ${technicianId}`,
      count: timeslots.length,
    };
  }

  /**
   * Daily maintenance: Delete expired timeslots and add new ones
   * This should be called by a cron job at midnight
   */
  async dailyTimeslotMaintenance() {
    const today = this.getLocalDateString();
    const dayThirty = new Date();
    dayThirty.setDate(dayThirty.getDate() + 30);
    const dayThirtyStr = this.getLocalDateString(dayThirty);

    console.log(`🔧 Maintenance started - Today: ${today}, Day 30: ${dayThirtyStr}`);

    // Delete timeslots older than today
    const deletedResult = await db
      .delete(schema.timeslots)
      .where(lt(schema.timeslots.date, today))
      .returning();

    const deletedCount = deletedResult.length;
    console.log(`🗑️  Deleted ${deletedCount} expired timeslots`);

    // Get all technicians
    const technicians = await db.query.users.findMany({
      where: eq(schema.users.role, 'technician'),
    });

    console.log(`👥 Found ${technicians.length} technicians`);

    const newTimeslots = [];

    // For each technician, check if they have a timeslot for day 30
    for (const technician of technicians) {
      const existingTimeslot = await db.query.timeslots.findFirst({
        where: and(
          eq(schema.timeslots.technicianId, technician.id),
          eq(schema.timeslots.date, dayThirtyStr),
        ),
      });

      if (!existingTimeslot) {
        newTimeslots.push({
          technicianId: technician.id,
          date: dayThirtyStr,
          slots: [...this.DEFAULT_SLOTS],
        });
        console.log(`➕ Will create timeslot for technician ${technician.id} on ${dayThirtyStr}`);
      } else {
        console.log(`⏭️  Timeslot already exists for technician ${technician.id} on ${dayThirtyStr}`);
      }
    }

    // Insert new timeslots
    if (newTimeslots.length > 0) {
      console.log(`💾 Inserting ${newTimeslots.length} new timeslots...`);
      try {
        await db.insert(schema.timeslots).values(newTimeslots);
        console.log(`✅ Successfully inserted ${newTimeslots.length} timeslots`);
      } catch (error) {
        console.error(`❌ Failed to insert timeslots:`, error);
        throw error;
      }
    } else {
      console.log(`ℹ️  No new timeslots to create (all technicians already have timeslots for ${dayThirtyStr})`);
    }

    const result = {
      message: 'Daily timeslot maintenance completed',
      deletedCount,
      addedCount: newTimeslots.length,
      date: today,
      dayThirtyDate: dayThirtyStr,
      technicianCount: technicians.length,
    };

    console.log(`✅ Maintenance completed:`, result);
    return result;
  }

  /**
   * Get timeslots for a specific technician within a date range
   */
  async getTechnicianAvailability(technicianId: number, startDate: string, endDate: string) {
    const timeslots = await db.query.timeslots.findMany({
      where: and(
        eq(schema.timeslots.technicianId, technicianId),
        gte(schema.timeslots.date, startDate),
        lte(schema.timeslots.date, endDate),
      ),
      orderBy: (timeslots, { asc }) => [asc(timeslots.date)],
    });

    return {
      technicianId,
      startDate,
      endDate,
      timeslots,
    };
  }

  /**
   * Remove slots from a technician's timeslot (for booking system)
   * This is called automatically when a booking is created
   *
   * @param technicianId - Technician ID
   * @param date - Date of the booking (YYYY-MM-DD)
   * @param startHour - Starting hour (e.g., 10 for 10am)
   * @param durationMinutes - Duration in minutes
   * @returns Updated timeslot
   */
  async removeSlotsForBooking(
    technicianId: number,
    date: string,
    startHour: number,
    durationMinutes: number,
  ) {
    // Calculate which hours are needed based on duration
    // Add 1 hour buffer (60 minutes) as per booking logic
    const totalMinutes = durationMinutes + 60; // Extra hour buffer
    const requiredHours = Math.ceil(totalMinutes / 60);

    // Calculate which hours to remove
    const hoursToRemove: number[] = [];
    for (let i = 0; i < requiredHours; i++) {
      hoursToRemove.push(startHour + i);
    }

    // Find the timeslot for this technician and date
    const timeslot = await db.query.timeslots.findFirst({
      where: and(eq(schema.timeslots.technicianId, technicianId), eq(schema.timeslots.date, date)),
    });

    if (!timeslot) {
      throw new NotFoundException(`Timeslot not found for technician ${technicianId} on ${date}`);
    }

    // Verify all required hours are available
    const availableSlots = timeslot.slots;
    const missingHours = hoursToRemove.filter((hour) => !availableSlots.includes(hour));

    if (missingHours.length > 0) {
      throw new BadRequestException(
        `Technician ${technicianId} is not available at hours: ${missingHours.join(', ')} on ${date}`,
      );
    }

    // Remove the hours from available slots
    const updatedSlots = availableSlots.filter((slot) => !hoursToRemove.includes(slot));

    // Update the timeslot
    const [updatedTimeslot] = await db
      .update(schema.timeslots)
      .set({
        slots: updatedSlots,
        updatedAt: new Date(),
      })
      .where(eq(schema.timeslots.id, timeslot.id))
      .returning();

    return updatedTimeslot;
  }

  /**
   * Restore slots to a technician's timeslot (for booking cancellation)
   * This is called automatically when a booking is cancelled
   *
   * @param technicianId - Technician ID
   * @param date - Date of the booking (YYYY-MM-DD)
   * @param startHour - Starting hour (e.g., 10 for 10am)
   * @param durationMinutes - Duration in minutes
   * @returns Updated timeslot
   */
  async restoreSlotsForBooking(
    technicianId: number,
    date: string,
    startHour: number,
    durationMinutes: number,
  ) {
    // Calculate which hours were used
    const totalMinutes = durationMinutes + 60; // Extra hour buffer
    const requiredHours = Math.ceil(totalMinutes / 60);

    const hoursToRestore: number[] = [];
    for (let i = 0; i < requiredHours; i++) {
      hoursToRestore.push(startHour + i);
    }

    // Find the timeslot
    const timeslot = await db.query.timeslots.findFirst({
      where: and(eq(schema.timeslots.technicianId, technicianId), eq(schema.timeslots.date, date)),
    });

    if (!timeslot) {
      throw new NotFoundException(`Timeslot not found for technician ${technicianId} on ${date}`);
    }

    // Add back the hours (avoid duplicates)
    const currentSlots = timeslot.slots;
    const updatedSlots = [...new Set([...currentSlots, ...hoursToRestore])].sort((a, b) => a - b);

    // Update the timeslot
    const [updatedTimeslot] = await db
      .update(schema.timeslots)
      .set({
        slots: updatedSlots,
        updatedAt: new Date(),
      })
      .where(eq(schema.timeslots.id, timeslot.id))
      .returning();

    return updatedTimeslot;
  }

  /**
   * Delete all timeslots for a technician
   * This is called automatically when a technician account is deleted
   *
   * @param technicianId - Technician ID
   * @returns Number of deleted timeslots
   */
  async deleteTechnicianTimeslots(technicianId: number) {
    const deletedResult = await db
      .delete(schema.timeslots)
      .where(eq(schema.timeslots.technicianId, technicianId))
      .returning();

    return {
      message: `Deleted ${deletedResult.length} timeslots for technician ${technicianId}`,
      count: deletedResult.length,
    };
  }
}
