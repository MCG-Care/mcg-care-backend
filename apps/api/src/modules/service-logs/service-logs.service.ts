import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { UpdateServiceLogDto } from './dto/update-service-log.dto';

@Injectable()
export class ServiceLogsService {
  /**
   * Create a service log for a booking (technician only, during service)
   */
  async create(userId: number, userRole: string, createServiceLogDto: CreateServiceLogDto) {
    const { bookingId, note } = createServiceLogDto;

    // Only technicians can create service logs
    if (userRole !== 'technician') {
      throw new ForbiddenException('Only technicians can create service logs');
    }

    // Check if booking exists
    const booking = await db.query.bookings.findFirst({
      where: eq(schema.bookings.id, bookingId),
      with: {
        aircon: {
          with: {
            customer: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Verify technician is assigned to this booking
    if (booking.technicianId !== userId) {
      throw new ForbiddenException('You can only create service logs for your assigned bookings');
    }

    // Technicians can create logs for any booking status (not just inprogress)
    // This allows them to add logs even if they forgot during the service

    // Check if service log already exists for this booking
    const existingLog = await db.query.serviceLogs.findFirst({
      where: eq(schema.serviceLogs.bookingId, bookingId),
    });

    if (existingLog) {
      throw new BadRequestException(
        'Service log already exists for this booking. Use update instead.',
      );
    }

    // Create service log
    const [newLog] = await db
      .insert(schema.serviceLogs)
      .values({
        bookingId,
        note,
      })
      .returning();

    return this.findOne(newLog.id, userId, userRole);
  }

  /**
   * Get service log by booking ID
   */
  async findByBookingId(bookingId: number, userId: number, userRole: string) {
    // Verify booking exists and user has access
    const booking = await db.query.bookings.findFirst({
      where: eq(schema.bookings.id, bookingId),
      with: {
        aircon: {
          with: {
            customer: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Authorization check
    if (userRole === 'customer') {
      if (booking.aircon.customerId !== userId) {
        throw new ForbiddenException('You can only view service logs for your own bookings');
      }
    } else if (userRole === 'technician') {
      if (booking.technicianId !== userId) {
        throw new ForbiddenException('You can only view service logs for your assigned bookings');
      }
    }

    const serviceLog = await db.query.serviceLogs.findFirst({
      where: eq(schema.serviceLogs.bookingId, bookingId),
      with: {
        booking: {
          with: {
            technician: true,
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
          },
        },
      },
    });

    if (!serviceLog) {
      throw new NotFoundException(`Service log not found for booking ${bookingId}`);
    }

    return serviceLog;
  }

  /**
   * Get all service logs for a specific aircon (customer product)
   * This shows the complete service history of an aircon
   */
  async findByAirconId(airconId: number, userId: number, userRole: string) {
    // Verify aircon exists and get ownership info
    const aircon = await db.query.customerProducts.findFirst({
      where: eq(schema.customerProducts.id, airconId),
      with: {
        customer: true,
      },
    });

    if (!aircon) {
      throw new NotFoundException(`Customer product with ID ${airconId} not found`);
    }

    // Authorization check
    if (userRole === 'customer') {
      if (aircon.customerId !== userId) {
        throw new ForbiddenException('You can only view service logs for your own aircons');
      }
    }
    // Technicians and admins can view service logs for any aircon

    // Get all bookings for this aircon
    const bookings = await db.query.bookings.findMany({
      where: eq(schema.bookings.airconId, airconId),
    });

    if (bookings.length === 0) {
      return []; // No bookings, no service logs
    }

    const bookingIds = bookings.map((b) => b.id);

    // Get all service logs for these bookings
    const serviceLogs = await db.query.serviceLogs.findMany({
      where: inArray(schema.serviceLogs.bookingId, bookingIds),
      with: {
        booking: {
          with: {
            technician: true,
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
          },
        },
      },
      orderBy: [desc(schema.serviceLogs.createdAt)],
    });

    return serviceLogs;
  }

  /**
   * Find a single service log by ID
   */
  async findOne(id: number, userId: number, userRole: string) {
    const serviceLog = await db.query.serviceLogs.findFirst({
      where: eq(schema.serviceLogs.id, id),
      with: {
        booking: {
          with: {
            technician: true,
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
          },
        },
      },
    });

    if (!serviceLog) {
      throw new NotFoundException(`Service log with ID ${id} not found`);
    }

    // Authorization check
    if (userRole === 'customer') {
      if (serviceLog.booking.aircon.customerId !== userId) {
        throw new ForbiddenException('You can only view service logs for your own bookings');
      }
    } else if (userRole === 'technician') {
      if (serviceLog.booking.technicianId !== userId) {
        throw new ForbiddenException('You can only view service logs for your assigned bookings');
      }
    }

    return serviceLog;
  }

  /**
   * Update a service log (technician who created it only)
   */
  async update(
    id: number,
    userId: number,
    userRole: string,
    updateServiceLogDto: UpdateServiceLogDto,
  ) {
    const serviceLog = await this.findOne(id, userId, userRole);

    // Only technicians who created the log can update
    if (userRole !== 'technician') {
      throw new ForbiddenException('Only technicians can update service logs');
    }

    if (serviceLog.booking.technicianId !== userId) {
      throw new ForbiddenException('You can only update service logs for your assigned bookings');
    }

    const updateData: any = {};

    if (updateServiceLogDto.note !== undefined) {
      updateData.note = updateServiceLogDto.note;
    }

    await db.update(schema.serviceLogs).set(updateData).where(eq(schema.serviceLogs.id, id));

    return this.findOne(id, userId, userRole);
  }

  /**
   * Delete a service log (technician who created it or admin)
   */
  async remove(id: number, userId: number, userRole: string) {
    const serviceLog = await this.findOne(id, userId, userRole);

    // Only technicians who created it or admins can delete
    if (userRole === 'customer') {
      throw new ForbiddenException('Customers cannot delete service logs');
    }

    if (userRole === 'technician') {
      if (serviceLog.booking.technicianId !== userId) {
        throw new ForbiddenException('You can only delete service logs for your assigned bookings');
      }
    }

    await db.delete(schema.serviceLogs).where(eq(schema.serviceLogs.id, id));

    return { message: 'Service log deleted successfully' };
  }
}
