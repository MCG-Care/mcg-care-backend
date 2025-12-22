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
        if (userRole !== 'technician') {
            throw new common_1.ForbiddenException('Only technicians can create service logs');
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
        if (booking.technicianId !== userId) {
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
    async findByAirconId(airconId, userId, userRole) {
        const aircon = await database_1.db.query.customerProducts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.id, airconId),
            with: {
                customer: true,
            },
        });
        if (!aircon) {
            throw new common_1.NotFoundException(`Customer product with ID ${airconId} not found`);
        }
        if (userRole === 'customer') {
            if (aircon.customerId !== userId) {
                throw new common_1.ForbiddenException('You can only view service logs for your own aircons');
            }
        }
        const bookings = await database_1.db.query.bookings.findMany({
            where: (0, drizzle_orm_1.eq)(database_1.schema.bookings.airconId, airconId),
        });
        if (bookings.length === 0) {
            return [];
        }
        const bookingIds = bookings.map((b) => b.id);
        const serviceLogs = await database_1.db.query.serviceLogs.findMany({
            where: (0, drizzle_orm_1.inArray)(database_1.schema.serviceLogs.bookingId, bookingIds),
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
            orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.serviceLogs.createdAt)],
        });
        return serviceLogs;
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
        if (userRole !== 'technician') {
            throw new common_1.ForbiddenException('Only technicians can update service logs');
        }
        if (serviceLog.booking.technicianId !== userId) {
            throw new common_1.ForbiddenException('You can only update service logs for your assigned bookings');
        }
        const updateData = {};
        if (updateServiceLogDto.note !== undefined) {
            updateData.note = updateServiceLogDto.note;
        }
        await database_1.db
            .update(database_1.schema.serviceLogs)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(database_1.schema.serviceLogs.id, id));
        return this.findOne(id, userId, userRole);
    }
    async remove(id, userId, userRole) {
        const serviceLog = await this.findOne(id, userId, userRole);
        if (userRole === 'customer') {
            throw new common_1.ForbiddenException('Customers cannot delete service logs');
        }
        if (userRole === 'technician') {
            if (serviceLog.booking.technicianId !== userId) {
                throw new common_1.ForbiddenException('You can only delete service logs for your assigned bookings');
            }
        }
        await database_1.db
            .delete(database_1.schema.serviceLogs)
            .where((0, drizzle_orm_1.eq)(database_1.schema.serviceLogs.id, id));
        return { message: 'Service log deleted successfully' };
    }
};
exports.ServiceLogsService = ServiceLogsService;
exports.ServiceLogsService = ServiceLogsService = __decorate([
    (0, common_1.Injectable)()
], ServiceLogsService);
//# sourceMappingURL=service-logs.service.js.map