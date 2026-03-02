"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbacksService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
const user_service_1 = require("../users/user.service");
let FeedbacksService = class FeedbacksService {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async create(userId, userRole, createFeedbackDto) {
        const { bookingId, rating, satisfaction, issueResolved, note } = createFeedbackDto;
        if (userRole !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can create feedback');
        }
        const booking = await database_1.db.query.bookings.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.bookings.id, bookingId),
            with: {
                aircon: {
                    with: {
                        customer: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${bookingId} not found`);
        }
        if (booking.aircon.customerId !== userId) {
            throw new common_1.ForbiddenException('You can only create feedback for your own bookings');
        }
        if (booking.status !== 'done') {
            throw new common_1.BadRequestException('You can only create feedback for completed bookings');
        }
        const existingFeedback = await database_1.db.query.feedbacks.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.feedbacks.bookingId, bookingId),
        });
        if (existingFeedback) {
            throw new common_1.BadRequestException('Feedback already exists for this booking. Use update instead.');
        }
        const [newFeedback] = await database_1.db
            .insert(database_1.schema.feedbacks)
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
    async findAll(userId, userRole, query) {
        const { page = 1, limit = 30, technicianId, minRating } = query;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (userRole === 'customer') {
            const customerBookings = await database_1.db
                .select({ id: database_1.schema.bookings.id })
                .from(database_1.schema.bookings)
                .innerJoin(database_1.schema.customerProducts, (0, drizzle_orm_1.eq)(database_1.schema.bookings.airconId, database_1.schema.customerProducts.id))
                .where((0, drizzle_orm_1.eq)(database_1.schema.customerProducts.customerId, userId));
            const bookingIds = customerBookings.map((b) => b.id);
            if (bookingIds.length === 0) {
                return {
                    data: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                };
            }
        }
        else if (userRole === 'technician') {
            if (technicianId && technicianId !== userId) {
                throw new common_1.ForbiddenException('You can only view feedback for your own bookings');
            }
        }
        else if (userRole === 'admin') {
        }
        if (minRating) {
            conditions.push((0, drizzle_orm_1.gte)(database_1.schema.feedbacks.rating, minRating));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const [{ count }] = await database_1.db
            .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(database_1.schema.feedbacks)
            .where(whereClause);
        let feedbacks = await database_1.db.query.feedbacks.findMany({
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
            limit: limit * 2,
            offset,
            orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.feedbacks.createdAt)],
        });
        if (userRole === 'customer') {
            feedbacks = feedbacks.filter((f) => f.booking.aircon.customerId === userId);
        }
        else if (userRole === 'technician') {
            feedbacks = feedbacks.filter((f) => f.booking.technicianId === userId);
        }
        else if (userRole === 'admin' && technicianId) {
            feedbacks = feedbacks.filter((f) => f.booking.technicianId === technicianId);
        }
        feedbacks = feedbacks.slice(0, limit);
        const response = {
            data: feedbacks,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        };
        if (technicianId) {
            try {
                const ratingData = await this.usersService.getTechnicianAverageRating(technicianId);
                response.technicianId = ratingData.technicianId;
                response.averageRating = ratingData.averageRating;
                response.averageRatingRounded = ratingData.averageRatingRounded;
                response.totalFeedbacks = ratingData.totalFeedbacks;
            }
            catch (_a) {
            }
        }
        return response;
    }
    async findByBookingId(bookingId, userId, userRole) {
        const booking = await database_1.db.query.bookings.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.bookings.id, bookingId),
            with: {
                aircon: {
                    with: {
                        customer: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${bookingId} not found`);
        }
        if (userRole === 'customer') {
            if (booking.aircon.customerId !== userId) {
                throw new common_1.ForbiddenException('You can only view feedback for your own bookings');
            }
        }
        else if (userRole === 'technician') {
            if (booking.technicianId !== userId) {
                throw new common_1.ForbiddenException('You can only view feedback for your assigned bookings');
            }
        }
        const feedback = await database_1.db.query.feedbacks.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.feedbacks.bookingId, bookingId),
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
            throw new common_1.NotFoundException(`Feedback not found for booking ${bookingId}`);
        }
        return feedback;
    }
    async findOne(id, userId, userRole) {
        const feedback = await database_1.db.query.feedbacks.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.feedbacks.id, id),
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
            throw new common_1.NotFoundException(`Feedback with ID ${id} not found`);
        }
        if (userRole === 'customer') {
            if (feedback.booking.aircon.customerId !== userId) {
                throw new common_1.ForbiddenException('You can only view your own feedback');
            }
        }
        else if (userRole === 'technician') {
            if (feedback.booking.technicianId !== userId) {
                throw new common_1.ForbiddenException('You can only view feedback for your assigned bookings');
            }
        }
        return feedback;
    }
    async update(id, userId, userRole, updateFeedbackDto) {
        const feedback = await this.findOne(id, userId, userRole);
        if (userRole !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can update their feedback');
        }
        if (feedback.booking.aircon.customerId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own feedback');
        }
        const updateData = {};
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
        await database_1.db.update(database_1.schema.feedbacks).set(updateData).where((0, drizzle_orm_1.eq)(database_1.schema.feedbacks.id, id));
        return this.findOne(id, userId, userRole);
    }
    async remove(id, userId, userRole) {
        const feedback = await this.findOne(id, userId, userRole);
        if (userRole === 'customer') {
            if (feedback.booking.aircon.customerId !== userId) {
                throw new common_1.ForbiddenException('You can only delete your own feedback');
            }
        }
        else if (userRole === 'technician') {
            throw new common_1.ForbiddenException('Technicians cannot delete feedback');
        }
        await database_1.db.delete(database_1.schema.feedbacks).where((0, drizzle_orm_1.eq)(database_1.schema.feedbacks.id, id));
        return { message: 'Feedback deleted successfully' };
    }
};
exports.FeedbacksService = FeedbacksService;
exports.FeedbacksService = FeedbacksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UsersService])
], FeedbacksService);
//# sourceMappingURL=feedbacks.service.js.map