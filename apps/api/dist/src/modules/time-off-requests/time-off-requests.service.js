"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffRequestsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
let TimeOffRequestsService = class TimeOffRequestsService {
    getLocalDateString(date = new Date()) {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        return formatter.format(date);
    }
    async create(technicianId, createDto) {
        const { startDate, endDate, startSlot, endSlot, isFullDay, reason } = createDto;
        const technician = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.id, technicianId),
        });
        if (!technician) {
            throw new common_1.NotFoundException(`Technician with ID ${technicianId} not found`);
        }
        if (technician.role !== 'technician') {
            throw new common_1.BadRequestException(`User with ID ${technicianId} is not a technician`);
        }
        if (new Date(startDate) > new Date(endDate)) {
            throw new common_1.BadRequestException('Start date must be before or equal to end date');
        }
        if (startSlot > endSlot) {
            throw new common_1.BadRequestException('Start slot must be before or equal to end slot');
        }
        const today = this.getLocalDateString();
        if (startDate < today) {
            throw new common_1.BadRequestException('Cannot request time off for past dates');
        }
        if (isFullDay && (startSlot !== 9 || endSlot !== 16)) {
            throw new common_1.BadRequestException('Full day requests must have startSlot=9 and endSlot=16');
        }
        const [newRequest] = await database_1.db
            .insert(database_1.schema.timeOffRequests)
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
    async findAll(query) {
        const { technicianId, status, startDate, endDate } = query;
        const conditions = [];
        if (technicianId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.timeOffRequests.technicianId, technicianId));
        }
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.timeOffRequests.status, status));
        }
        if (startDate) {
            conditions.push((0, drizzle_orm_1.gte)(database_1.schema.timeOffRequests.startDate, startDate));
        }
        if (endDate) {
            conditions.push((0, drizzle_orm_1.lte)(database_1.schema.timeOffRequests.endDate, endDate));
        }
        const whereCondition = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const requests = await database_1.db.query.timeOffRequests.findMany({
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
    async findOne(id) {
        const request = await database_1.db.query.timeOffRequests.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.timeOffRequests.id, id),
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
            throw new common_1.NotFoundException(`Time-off request with ID ${id} not found`);
        }
        return request;
    }
    async review(id, reviewerId, reviewDto) {
        const { status, reviewNote } = reviewDto;
        const request = await this.findOne(id);
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException(`Request has already been ${request.status}`);
        }
        const reviewer = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.id, reviewerId),
        });
        if (!reviewer || reviewer.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can review time-off requests');
        }
        if (status === 'approved') {
            await this.checkForExistingBookings(request);
        }
        const [updatedRequest] = await database_1.db
            .update(database_1.schema.timeOffRequests)
            .set({
            status,
            reviewerId,
            reviewedAt: new Date(),
            reviewNote,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.schema.timeOffRequests.id, id))
            .returning();
        if (status === 'approved') {
            await this.blockTimeslots(request);
        }
        return updatedRequest;
    }
    async checkForExistingBookings(request) {
        const { technicianId, startDate, endDate, startSlot, endSlot } = request;
        const dates = [];
        const currentDate = new Date(startDate);
        const finalDate = new Date(endDate);
        while (currentDate <= finalDate) {
            dates.push(this.getLocalDateString(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        for (const date of dates) {
            const bookings = await database_1.db.query.bookings.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.bookings.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.bookings.bookingForDate, date)),
            });
            for (const booking of bookings) {
                const bookingHour = parseInt(booking.bookingTime.split(':')[0]);
                const hoursNeeded = Math.ceil(booking.duration / 60);
                const occupiedHours = [];
                for (let i = 0; i < hoursNeeded; i++) {
                    occupiedHours.push(bookingHour + i);
                }
                const requestedSlots = [];
                for (let slot = startSlot; slot <= endSlot; slot++) {
                    requestedSlots.push(slot);
                }
                const conflictingSlots = occupiedHours.filter(hour => requestedSlots.includes(hour));
                if (conflictingSlots.length > 0) {
                    throw new common_1.BadRequestException(`Cannot approve: Existing booking (ID: ${booking.id}) on ${date} conflicts with requested time slots. ` +
                        `Booking occupies hours ${occupiedHours.join(', ')}, which overlaps with requested slots ${requestedSlots.join(', ')}.`);
                }
            }
        }
    }
    async blockTimeslots(request) {
        const { technicianId, startDate, endDate, startSlot, endSlot } = request;
        const dates = [];
        const currentDate = new Date(startDate);
        const finalDate = new Date(endDate);
        while (currentDate <= finalDate) {
            dates.push(this.getLocalDateString(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        const slotsToRemove = [];
        for (let slot = startSlot; slot <= endSlot; slot++) {
            slotsToRemove.push(slot);
        }
        for (const date of dates) {
            const timeslot = await database_1.db.query.timeslots.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, date)),
            });
            if (timeslot) {
                const currentSlots = timeslot.slots;
                const updatedSlots = currentSlots.filter((slot) => !slotsToRemove.includes(slot));
                await database_1.db
                    .update(database_1.schema.timeslots)
                    .set({
                    slots: updatedSlots,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(database_1.schema.timeslots.id, timeslot.id));
            }
            else {
                const allSlots = [9, 10, 11, 12, 13, 14, 15, 16];
                const availableSlots = allSlots.filter((slot) => !slotsToRemove.includes(slot));
                await database_1.db.insert(database_1.schema.timeslots).values({
                    technicianId,
                    date,
                    slots: availableSlots,
                });
            }
        }
    }
    async remove(id, userId, userRole) {
        const request = await this.findOne(id);
        if (userRole !== 'admin' && request.technicianId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own time-off requests');
        }
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('Cannot delete a request that has been reviewed');
        }
        await database_1.db.delete(database_1.schema.timeOffRequests).where((0, drizzle_orm_1.eq)(database_1.schema.timeOffRequests.id, id));
        return { message: 'Time-off request deleted successfully' };
    }
};
exports.TimeOffRequestsService = TimeOffRequestsService;
exports.TimeOffRequestsService = TimeOffRequestsService = __decorate([
    (0, common_1.Injectable)()
], TimeOffRequestsService);
//# sourceMappingURL=time-off-requests.service.js.map