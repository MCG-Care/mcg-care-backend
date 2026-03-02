import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { QueryFeedbacksDto } from './dto/query-feedbacks.dto';
import { UsersService } from '../users/user.service';

@Injectable()
export class FeedbacksService {
  constructor(private readonly usersService: UsersService) {}
  /**
   * Create a feedback for a booking (customer only, after service is done)
   */
  async create(userId: number, userRole: string, createFeedbackDto: CreateFeedbackDto) {
    const { bookingId, rating, satisfaction, issueResolved, note } = createFeedbackDto;

    // Only customers can create feedback
    if (userRole !== 'customer') {
      throw new ForbiddenException('Only customers can create feedback');
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

    // Verify customer owns the booking
    if ((booking.aircon as any).customerId !== userId) {
      throw new ForbiddenException('You can only create feedback for your own bookings');
    }

    // Check if booking is completed
    if (booking.status !== 'done') {
      throw new BadRequestException('You can only create feedback for completed bookings');
    }

    // Check if feedback already exists for this booking
    const existingFeedback = await db.query.feedbacks.findFirst({
      where: eq(schema.feedbacks.bookingId, bookingId),
    });

    if (existingFeedback) {
      throw new BadRequestException(
        'Feedback already exists for this booking. Use update instead.',
      );
    }

    // Create feedback
    const [newFeedback] = await db
      .insert(schema.feedbacks)
      .values({
        bookingId,
        rating,
        satisfaction: satisfaction || null,
        issueResolved: issueResolved !== undefined ? issueResolved : null,
        note: note || null,
      })
      .returning();

    return this.findOne(newFeedback.id, userId, userRole);
  }

  /**
   * Find all feedbacks with pagination and filters
   */
  async findAll(userId: number, userRole: string, query: QueryFeedbacksDto) {
    const { page = 1, limit = 30, technicianId, minRating } = query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (userRole === 'customer') {
      // Customers can only see their own feedback
      const customerBookings = await db
        .select({ id: schema.bookings.id })
        .from(schema.bookings)
        .innerJoin(
          schema.customerProducts,
          eq(schema.bookings.airconId, schema.customerProducts.id),
        )
        .where(eq(schema.customerProducts.customerId, userId));

      const bookingIds = customerBookings.map((b) => b.id);
      if (bookingIds.length === 0) {
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }
      // Note: We would use inArray here but let's fetch all and filter in memory for simplicity
    } else if (userRole === 'technician') {
      // Technicians can see feedback for their bookings
      if (technicianId && technicianId !== userId) {
        throw new ForbiddenException('You can only view feedback for your own bookings');
      }
      // We'll filter after joining with bookings
    } else if (userRole === 'admin') {
      // Admins can filter by technicianId
      // Will be filtered after joining with bookings
    }

    if (minRating) {
      conditions.push(gte(schema.feedbacks.rating, minRating));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.feedbacks)
      .where(whereClause);

    // Get feedbacks with relations
    let feedbacks = await db.query.feedbacks.findMany({
      where: whereClause,
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
      limit: limit * 2, // Fetch more to filter
      offset,
      orderBy: [desc(schema.feedbacks.createdAt)],
    });

    // Apply role-based filtering
    if (userRole === 'customer') {
      feedbacks = feedbacks.filter((f) => ((f.booking as any).aircon as any).customerId === userId);
    } else if (userRole === 'technician') {
      feedbacks = feedbacks.filter((f) => (f.booking as any).technicianId === userId);
    } else if (userRole === 'admin' && technicianId) {
      feedbacks = feedbacks.filter((f) => (f.booking as any).technicianId === technicianId);
    }

    // Limit results
    feedbacks = feedbacks.slice(0, limit);

    const response: {
      data: typeof feedbacks;
      pagination: { page: number; limit: number; total: number; totalPages: number };
      technicianId?: number;
      averageRating?: number;
      averageRatingRounded?: number;
      totalFeedbacks?: number;
    } = {
      data: feedbacks,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };

    // When filtering by technicianId, include average rating so clients can use one endpoint
    if (technicianId) {
      try {
        const ratingData =
          await this.usersService.getTechnicianAverageRating(technicianId);
        response.technicianId = ratingData.technicianId;
        response.averageRating = ratingData.averageRating;
        response.averageRatingRounded = ratingData.averageRatingRounded;
        response.totalFeedbacks = ratingData.totalFeedbacks;
      } catch {
        // If technician not found or not a technician, omit rating fields
      }
    }

    return response;
  }

  /**
   * Get feedback by booking ID
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
      if ((booking.aircon as any).customerId !== userId) {
        throw new ForbiddenException('You can only view feedback for your own bookings');
      }
    } else if (userRole === 'technician') {
      if ((booking as any).technicianId !== userId) {
        throw new ForbiddenException('You can only view feedback for your assigned bookings');
      }
    }

    const feedback = await db.query.feedbacks.findFirst({
      where: eq(schema.feedbacks.bookingId, bookingId),
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

    if (!feedback) {
      throw new NotFoundException(`Feedback not found for booking ${bookingId}`);
    }

    return feedback;
  }

  /**
   * Find a single feedback by ID
   */
  async findOne(id: number, userId: number, userRole: string) {
    const feedback = await db.query.feedbacks.findFirst({
      where: eq(schema.feedbacks.id, id),
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

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }

    // Authorization check
    if (userRole === 'customer') {
      if (((feedback.booking as any).aircon as any).customerId !== userId) {
        throw new ForbiddenException('You can only view your own feedback');
      }
    } else if (userRole === 'technician') {
      if ((feedback.booking as any).technicianId !== userId) {
        throw new ForbiddenException('You can only view feedback for your assigned bookings');
      }
    }

    return feedback;
  }

  /**
   * Update a feedback (customer who created it only)
   */
  async update(id: number, userId: number, userRole: string, updateFeedbackDto: UpdateFeedbackDto) {
    const feedback = await this.findOne(id, userId, userRole);

    // Only customers who created the feedback can update
    if (userRole !== 'customer') {
      throw new ForbiddenException('Only customers can update their feedback');
    }

    if (((feedback.booking as any).aircon as any).customerId !== userId) {
      throw new ForbiddenException('You can only update your own feedback');
    }

    const updateData: any = {};

    if (updateFeedbackDto.rating !== undefined) {
      updateData.rating = updateFeedbackDto.rating;
    }
    if (updateFeedbackDto.satisfaction !== undefined) {
      updateData.satisfaction = updateFeedbackDto.satisfaction;
    }
    if (updateFeedbackDto.issueResolved !== undefined) {
      updateData.issueResolved = updateFeedbackDto.issueResolved;
    }
    if (updateFeedbackDto.note !== undefined) {
      updateData.note = updateFeedbackDto.note;
    }

    await db.update(schema.feedbacks).set(updateData).where(eq(schema.feedbacks.id, id));

    return this.findOne(id, userId, userRole);
  }

  /**
   * Delete a feedback (customer who created it or admin)
   */
  async remove(id: number, userId: number, userRole: string) {
    const feedback = await this.findOne(id, userId, userRole);

    // Only customers who created it or admins can delete
    if (userRole === 'customer') {
      if (((feedback.booking as any).aircon as any).customerId !== userId) {
        throw new ForbiddenException('You can only delete your own feedback');
      }
    } else if (userRole === 'technician') {
      throw new ForbiddenException('Technicians cannot delete feedback');
    }

    await db.delete(schema.feedbacks).where(eq(schema.feedbacks.id, id));

    return { message: 'Feedback deleted successfully' };
  }
}



