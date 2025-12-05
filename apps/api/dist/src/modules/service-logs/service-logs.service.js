"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceLogsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
let ServiceLogsService = class ServiceLogsService {
    async create(userId, userRole, createServiceLogDto) {
        const { bookingId, note } = createServiceLogDto;
        if (userRole !== 'technician' && userRole !== 'admin') {
            throw new common_1.ForbiddenException('Only technicians and admins can create service logs');
        }
        const booking = await database_1.db.query.bookings.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.bookings.id, bookingId),
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${bookingId} not found`);
        }
        if (userRole === 'technician' && booking.technicianId !== userId) {
            throw new common_1.ForbiddenException('You can only create service logs for your assigned bookings');
        }
        const existingLog = await database_1.db.query.serviceLogs.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.serviceLogs.bookingId, bookingId),
        });
        if (existingLog) {
            throw new common_1.BadRequestException('Service log already exists for this booking. Use update instead.');
        }
        const [newLog] = await database_1.db
            .insert(database_1.schema.serviceLogs)
            .values({
            bookingId,
            note,
        })
            .returning();
        return this.findOne(newLog.id, userId, userRole);
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
                throw new common_1.ForbiddenException('You can only view service logs for your own bookings');
            }
        }
        else if (userRole === 'technician') {
            if (booking.technicianId !== userId) {
                throw new common_1.ForbiddenException('You can only view service logs for your assigned bookings');
            }
        }
        const serviceLog = await database_1.db.query.serviceLogs.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.serviceLogs.bookingId, bookingId),
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
            throw new common_1.NotFoundException(`Service log not found for booking ${bookingId}`);
        }
        return serviceLog;
    }
    async findOne(id, userId, userRole) {
        const serviceLog = await database_1.db.query.serviceLogs.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.serviceLogs.id, id),
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
            throw new common_1.NotFoundException(`Service log with ID ${id} not found`);
        }
        if (userRole === 'customer') {
            if (serviceLog.booking.aircon.customerId !== userId) {
                throw new common_1.ForbiddenException('You can only view service logs for your own bookings');
            }
        }
        else if (userRole === 'technician') {
            if (serviceLog.booking.technicianId !== userId) {
                throw new common_1.ForbiddenException('You can only view service logs for your assigned bookings');
            }
        }
        return serviceLog;
    }
    async update(id, userId, userRole, updateServiceLogDto) {
        const serviceLog = await this.findOne(id, userId, userRole);
        if (userRole !== 'technician' && userRole !== 'admin') {
            throw new common_1.ForbiddenException('Only technicians and admins can update service logs');
        }
        if (userRole === 'technician' &&
            serviceLog.booking.technicianId !== userId) {
            throw new common_1.ForbiddenException('You can only update service logs for your assigned bookings');
        }
        await database_1.db
            .update(database_1.schema.serviceLogs)
            .set({
            note: updateServiceLogDto.note,
        })
            .where((0, drizzle_orm_1.eq)(database_1.schema.serviceLogs.id, id));
        return this.findOne(id, userId, userRole);
    }
    async remove(id, userId, userRole) {
        const serviceLog = await this.findOne(id, userId, userRole);
        if (userRole !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can delete service logs');
        }
        await database_1.db.delete(database_1.schema.serviceLogs).where((0, drizzle_orm_1.eq)(database_1.schema.serviceLogs.id, id));
        return { message: 'Service log deleted successfully' };
    }
};
exports.ServiceLogsService = ServiceLogsService;
exports.ServiceLogsService = ServiceLogsService = __decorate([
    (0, common_1.Injectable)()
], ServiceLogsService);
//# sourceMappingURL=service-logs.service.js.map