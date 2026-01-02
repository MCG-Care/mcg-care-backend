"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeslotsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
let TimeslotsService = class TimeslotsService {
    constructor() {
        this.DEFAULT_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16];
    }
    getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    async create(createTimeslotDto) {
        const { technicianId, date, slots } = createTimeslotDto;
        const technician = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.id, technicianId),
        });
        if (!technician) {
            throw new common_1.NotFoundException(`Technician with ID ${technicianId} not found`);
        }
        if (technician.role !== 'technician') {
            throw new common_1.BadRequestException(`User with ID ${technicianId} is not a technician`);
        }
        const existingTimeslot = await database_1.db.query.timeslots.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, date)),
        });
        if (existingTimeslot) {
            throw new common_1.BadRequestException(`Timeslot already exists for technician ${technicianId} on ${date}`);
        }
        const [newTimeslot] = await database_1.db
            .insert(database_1.schema.timeslots)
            .values({
            technicianId,
            date,
            slots,
        })
            .returning();
        return newTimeslot;
    }
    async findAll(query) {
        const { technicianId, date, startDate, endDate } = query;
        const conditions = [];
        if (technicianId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId));
        }
        if (date) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, date));
        }
        else {
            if (startDate) {
                conditions.push((0, drizzle_orm_1.gte)(database_1.schema.timeslots.date, startDate));
            }
            if (endDate) {
                conditions.push((0, drizzle_orm_1.lte)(database_1.schema.timeslots.date, endDate));
            }
        }
        const whereCondition = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const timeslots = await database_1.db.query.timeslots.findMany({
            where: whereCondition,
            with: {
                technician: {
                    with: {
                        address: true,
                    },
                },
            },
            orderBy: (timeslots, { asc }) => [asc(timeslots.date), asc(timeslots.technicianId)],
        });
        return timeslots;
    }
    async findOne(id) {
        const timeslot = await database_1.db.query.timeslots.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.timeslots.id, id),
            with: {
                technician: {
                    with: {
                        address: true,
                    },
                },
            },
        });
        if (!timeslot) {
            throw new common_1.NotFoundException(`Timeslot with ID ${id} not found`);
        }
        return timeslot;
    }
    async update(id, updateTimeslotDto) {
        await this.findOne(id);
        const [updatedTimeslot] = await database_1.db
            .update(database_1.schema.timeslots)
            .set({
            slots: updateTimeslotDto.slots,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.schema.timeslots.id, id))
            .returning();
        return updatedTimeslot;
    }
    async remove(id) {
        await this.findOne(id);
        await database_1.db.delete(database_1.schema.timeslots).where((0, drizzle_orm_1.eq)(database_1.schema.timeslots.id, id));
        return { message: 'Timeslot deleted successfully' };
    }
    async initializeTechnicianTimeslots(technicianId) {
        const technician = await database_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.id, technicianId),
        });
        if (!technician || technician.role !== 'technician') {
            throw new common_1.BadRequestException(`Invalid technician ID: ${technicianId}`);
        }
        const today = new Date();
        const timeslots = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dateStr = this.getLocalDateString(date);
            const existing = await database_1.db.query.timeslots.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, dateStr)),
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
            await database_1.db.insert(database_1.schema.timeslots).values(timeslots);
        }
        return {
            message: `Initialized ${timeslots.length} timeslots for technician ${technicianId}`,
            count: timeslots.length,
        };
    }
    async dailyTimeslotMaintenance() {
        const today = this.getLocalDateString();
        const dayThirty = new Date();
        dayThirty.setDate(dayThirty.getDate() + 30);
        const dayThirtyStr = this.getLocalDateString(dayThirty);
        const deletedResult = await database_1.db
            .delete(database_1.schema.timeslots)
            .where((0, drizzle_orm_1.lt)(database_1.schema.timeslots.date, today))
            .returning();
        const deletedCount = deletedResult.length;
        const technicians = await database_1.db.query.users.findMany({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.role, 'technician'),
        });
        const newTimeslots = [];
        for (const technician of technicians) {
            const existingTimeslot = await database_1.db.query.timeslots.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technician.id), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, dayThirtyStr)),
            });
            if (!existingTimeslot) {
                newTimeslots.push({
                    technicianId: technician.id,
                    date: dayThirtyStr,
                    slots: [...this.DEFAULT_SLOTS],
                });
            }
        }
        if (newTimeslots.length > 0) {
            await database_1.db.insert(database_1.schema.timeslots).values(newTimeslots);
        }
        return {
            message: 'Daily timeslot maintenance completed',
            deletedCount,
            addedCount: newTimeslots.length,
            date: today,
        };
    }
    async getTechnicianAvailability(technicianId, startDate, endDate) {
        const timeslots = await database_1.db.query.timeslots.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId), (0, drizzle_orm_1.gte)(database_1.schema.timeslots.date, startDate), (0, drizzle_orm_1.lte)(database_1.schema.timeslots.date, endDate)),
            orderBy: (timeslots, { asc }) => [asc(timeslots.date)],
        });
        return {
            technicianId,
            startDate,
            endDate,
            timeslots,
        };
    }
    async removeSlotsForBooking(technicianId, date, startHour, durationMinutes) {
        const totalMinutes = durationMinutes + 60;
        const requiredHours = Math.ceil(totalMinutes / 60);
        const hoursToRemove = [];
        for (let i = 0; i < requiredHours; i++) {
            hoursToRemove.push(startHour + i);
        }
        const timeslot = await database_1.db.query.timeslots.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, date)),
        });
        if (!timeslot) {
            throw new common_1.NotFoundException(`Timeslot not found for technician ${technicianId} on ${date}`);
        }
        const availableSlots = timeslot.slots;
        const missingHours = hoursToRemove.filter((hour) => !availableSlots.includes(hour));
        if (missingHours.length > 0) {
            throw new common_1.BadRequestException(`Technician ${technicianId} is not available at hours: ${missingHours.join(', ')} on ${date}`);
        }
        const updatedSlots = availableSlots.filter((slot) => !hoursToRemove.includes(slot));
        const [updatedTimeslot] = await database_1.db
            .update(database_1.schema.timeslots)
            .set({
            slots: updatedSlots,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.schema.timeslots.id, timeslot.id))
            .returning();
        return updatedTimeslot;
    }
    async restoreSlotsForBooking(technicianId, date, startHour, durationMinutes) {
        const totalMinutes = durationMinutes + 60;
        const requiredHours = Math.ceil(totalMinutes / 60);
        const hoursToRestore = [];
        for (let i = 0; i < requiredHours; i++) {
            hoursToRestore.push(startHour + i);
        }
        const timeslot = await database_1.db.query.timeslots.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, date)),
        });
        if (!timeslot) {
            throw new common_1.NotFoundException(`Timeslot not found for technician ${technicianId} on ${date}`);
        }
        const currentSlots = timeslot.slots;
        const updatedSlots = [...new Set([...currentSlots, ...hoursToRestore])].sort((a, b) => a - b);
        const [updatedTimeslot] = await database_1.db
            .update(database_1.schema.timeslots)
            .set({
            slots: updatedSlots,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.schema.timeslots.id, timeslot.id))
            .returning();
        return updatedTimeslot;
    }
    async deleteTechnicianTimeslots(technicianId) {
        const deletedResult = await database_1.db
            .delete(database_1.schema.timeslots)
            .where((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId))
            .returning();
        return {
            message: `Deleted ${deletedResult.length} timeslots for technician ${technicianId}`,
            count: deletedResult.length,
        };
    }
};
exports.TimeslotsService = TimeslotsService;
exports.TimeslotsService = TimeslotsService = __decorate([
    (0, common_1.Injectable)()
], TimeslotsService);
//# sourceMappingURL=timeslots.service.js.map