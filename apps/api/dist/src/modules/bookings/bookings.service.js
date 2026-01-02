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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
const supabase_service_1 = require("../../config/supabase.service");
let BookingsService = class BookingsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(customerId, createBookingDto, imageFiles) {
        const { airconId, serviceIds, bookingForDate, bookingTime, description } = createBookingDto;
        const aircon = await database_1.db.query.customerProducts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.id, airconId),
            with: {
                customer: {
                    with: {
                        address: true,
                    },
                },
                product: true,
            },
        });
        if (!aircon) {
            throw new common_1.NotFoundException(`Aircon with ID ${airconId} not found`);
        }
        if (aircon.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only book services for your own aircons');
        }
        if (!aircon.customer.address) {
            throw new common_1.BadRequestException('Customer address is required for booking. Please update your profile.');
        }
        const customerDistrict = aircon.customer.address.district;
        const services = await database_1.db.query.serviceTypes.findMany({
            where: (0, drizzle_orm_1.inArray)(database_1.schema.serviceTypes.id, serviceIds),
        });
        if (services.length !== serviceIds.length) {
            throw new common_1.BadRequestException('One or more service IDs are invalid');
        }
        const serviceDuration = services.reduce((sum, service) => sum + service.duration, 0);
        const totalFees = services.reduce((sum, service) => sum + parseFloat(service.serviceFee), 0);
        const serviceHours = Math.ceil(serviceDuration / 60);
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
        const bangkokNow = new Date(parseInt(parts.find(p => p.type === 'year').value), parseInt(parts.find(p => p.type === 'month').value) - 1, parseInt(parts.find(p => p.type === 'day').value), parseInt(parts.find(p => p.type === 'hour').value), parseInt(parts.find(p => p.type === 'minute').value), parseInt(parts.find(p => p.type === 'second').value));
        const today = new Date(bangkokNow);
        today.setHours(0, 0, 0, 0);
        const bookingDate = new Date(bookingForDate);
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate < today) {
            throw new common_1.BadRequestException('Cannot book for past dates');
        }
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 30);
        if (bookingDate > maxDate) {
            throw new common_1.BadRequestException('Cannot book more than 30 days in advance');
        }
        if (bookingTime < 9 || bookingTime > 16) {
            throw new common_1.BadRequestException('Booking time must be between 9 and 16');
        }
        if (bookingDate.getTime() === today.getTime()) {
            const currentHour = bangkokNow.getHours();
            const currentMinute = bangkokNow.getMinutes();
            if (bookingTime <= currentHour) {
                throw new common_1.BadRequestException(`Cannot book for ${bookingTime}:00 as this time has already passed. Current time in Bangkok is ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
            }
        }
        const serviceEndTime = bookingTime + serviceHours;
        if (serviceEndTime > 17) {
            throw new common_1.BadRequestException(`Service duration (${serviceHours} hours) extends beyond working hours (5 PM). Please choose an earlier time.`);
        }
        const hasSlotForTraffic = serviceEndTime < 17;
        const totalDuration = hasSlotForTraffic ? serviceDuration + 60 : serviceDuration;
        const requiredHours = Math.ceil(totalDuration / 60);
        const assignedTechnicianId = await this.findAvailableTechnician(serviceIds, customerDistrict, bookingForDate, bookingTime, requiredHours);
        if (!assignedTechnicianId) {
            throw new common_1.BadRequestException('No available technician found for the selected date, time, and services. Please try a different time slot.');
        }
        const bookingOnDate = new Date().toISOString().split('T')[0];
        const bookingTimeStr = `${bookingTime.toString().padStart(2, '0')}:00:00`;
        const [newBooking] = await database_1.db
            .insert(database_1.schema.bookings)
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
        const bookingServiceRecords = serviceIds.map((serviceId) => ({
            bookingId: newBooking.id,
            serviceId,
        }));
        await database_1.db.insert(database_1.schema.bookingServices).values(bookingServiceRecords);
        await this.updateTimeslots(assignedTechnicianId, bookingForDate, bookingTime, requiredHours);
        if (imageFiles && imageFiles.length > 0) {
            const imageUrls = await this.uploadBookingImages(newBooking.id, imageFiles);
            const imageRecords = imageUrls.map((url) => ({
                bookingId: newBooking.id,
                url,
            }));
            await database_1.db.insert(database_1.schema.bookingImages).values(imageRecords);
        }
        return this.findOne(newBooking.id, customerId, 'customer');
    }
    async findAvailableTechnician(serviceIds, customerDistrict, bookingDate, startHour, requiredHours) {
        const technicians = await database_1.db.query.users.findMany({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.role, 'technician'),
            with: {
                address: true,
                technicianServices: {
                    with: {
                        service: true,
                    },
                },
            },
        });
        const techsInDistrict = technicians.filter((tech) => { var _a; return ((_a = tech.address) === null || _a === void 0 ? void 0 : _a.district) === customerDistrict; });
        if (techsInDistrict.length === 0) {
            return null;
        }
        const shuffled = this.shuffleArray([...techsInDistrict]);
        for (const tech of shuffled) {
            const techServiceIds = tech.technicianServices.map((ts) => ts.serviceId);
            const hasAllServices = serviceIds.every((serviceId) => techServiceIds.includes(serviceId));
            if (!hasAllServices) {
                continue;
            }
            const hasAvailability = await this.checkTechnicianAvailability(tech.id, bookingDate, startHour, requiredHours);
            if (hasAvailability) {
                return tech.id;
            }
        }
        return null;
    }
    async checkTechnicianAvailability(technicianId, date, startHour, requiredHours) {
        const timeslot = await database_1.db.query.timeslots.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, date)),
        });
        if (!timeslot || !timeslot.slots) {
            return false;
        }
        const requiredSlots = Array.from({ length: requiredHours }, (_, i) => startHour + i);
        return requiredSlots.every((hour) => timeslot.slots.includes(hour));
    }
    async updateTimeslots(technicianId, date, startHour, requiredHours) {
        const timeslot = await database_1.db.query.timeslots.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, technicianId), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, date)),
        });
        if (!timeslot) {
            throw new common_1.BadRequestException('Timeslot not found');
        }
        const hoursToRemove = Array.from({ length: requiredHours }, (_, i) => startHour + i);
        const updatedSlots = timeslot.slots.filter((slot) => !hoursToRemove.includes(slot));
        await database_1.db
            .update(database_1.schema.timeslots)
            .set({
            slots: updatedSlots,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.schema.timeslots.id, timeslot.id));
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    async findAll(userId, userRole, query) {
        const { page = 1, limit = 10, customerId, technicianId, airconId, status, bookingForDate, } = query;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (userRole === 'customer') {
            const customerAircons = await database_1.db.query.customerProducts.findMany({
                where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.customerId, userId),
            });
            const airconIds = customerAircons.map((a) => a.id);
            if (airconIds.length > 0) {
                conditions.push((0, drizzle_orm_1.inArray)(database_1.schema.bookings.airconId, airconIds));
            }
            else {
                return {
                    data: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                };
            }
        }
        else if (userRole === 'technician') {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.bookings.technicianId, userId));
        }
        else if (userRole === 'admin') {
            if (customerId) {
                const customerAircons = await database_1.db.query.customerProducts.findMany({
                    where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.customerId, customerId),
                });
                const airconIds = customerAircons.map((a) => a.id);
                if (airconIds.length > 0) {
                    conditions.push((0, drizzle_orm_1.inArray)(database_1.schema.bookings.airconId, airconIds));
                }
            }
            if (technicianId) {
                conditions.push((0, drizzle_orm_1.eq)(database_1.schema.bookings.technicianId, technicianId));
            }
        }
        if (airconId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.bookings.airconId, airconId));
        }
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.bookings.status, status));
        }
        if (bookingForDate) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.bookings.bookingForDate, bookingForDate));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const [{ count }] = await database_1.db
            .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(database_1.schema.bookings)
            .where(whereClause);
        const bookings = await database_1.db.query.bookings.findMany({
            where: whereClause,
            with: {
                technician: {
                    with: {
                        address: true,
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
            orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.bookings.createdAt)],
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
    async findOne(id, userId, userRole) {
        const booking = await database_1.db.query.bookings.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.bookings.id, id),
            with: {
                technician: {
                    with: {
                        address: true,
                    },
                },
                aircon: {
                    with: {
                        customer: {
                            with: {
                                address: true,
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
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        if (userRole === 'customer') {
            if (booking.aircon.customerId !== userId) {
                throw new common_1.ForbiddenException('You can only view your own bookings');
            }
        }
        else if (userRole === 'technician') {
            if (booking.technicianId !== userId) {
                throw new common_1.ForbiddenException('You can only view your assigned bookings');
            }
        }
        return booking;
    }
    async update(id, userId, userRole, updateBookingDto) {
        const booking = await this.findOne(id, userId, userRole);
        if (userRole === 'customer') {
            throw new common_1.ForbiddenException('Customers cannot update bookings');
        }
        if (userRole === 'technician' && booking.technicianId !== userId) {
            throw new common_1.ForbiddenException('You can only update your assigned bookings');
        }
        const updateData = {
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
        await database_1.db.update(database_1.schema.bookings).set(updateData).where((0, drizzle_orm_1.eq)(database_1.schema.bookings.id, id));
        return this.findOne(id, userId, userRole);
    }
    async remove(id, userId, userRole) {
        const booking = await this.findOne(id, userId, userRole);
        if (userRole === 'technician') {
            throw new common_1.ForbiddenException('Technicians cannot delete bookings');
        }
        if (userRole === 'customer') {
            if (booking.aircon.customerId !== userId) {
                throw new common_1.ForbiddenException('You can only delete your own bookings');
            }
            if (booking.status !== 'pending') {
                throw new common_1.ForbiddenException('You can only delete pending bookings');
            }
        }
        if (booking.bookingImages && booking.bookingImages.length > 0) {
            const imagePaths = booking.bookingImages.map((img) => this.supabaseService.extractPathFromUrl(img.url, 'booking-images'));
            await this.supabaseService.deleteFiles('booking-images', imagePaths);
        }
        if (booking.status === 'pending') {
            await this.restoreTimeslots(booking);
        }
        await database_1.db.delete(database_1.schema.bookings).where((0, drizzle_orm_1.eq)(database_1.schema.bookings.id, id));
        return { message: 'Booking deleted successfully' };
    }
    async restoreTimeslots(booking) {
        const timeslot = await database_1.db.query.timeslots.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.timeslots.technicianId, booking.technicianId), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, booking.bookingForDate)),
        });
        if (!timeslot) {
            return;
        }
        const startHour = parseInt(booking.bookingTime.split(':')[0]);
        const requiredHours = Math.ceil(booking.duration / 60);
        const hoursToRestore = Array.from({ length: requiredHours }, (_, i) => startHour + i);
        const restoredSlots = [...new Set([...timeslot.slots, ...hoursToRestore])].sort((a, b) => a - b);
        await database_1.db
            .update(database_1.schema.timeslots)
            .set({
            slots: restoredSlots,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.schema.timeslots.id, timeslot.id));
    }
    async removeImage(bookingId, imageId, userId, userRole) {
        const booking = await this.findOne(bookingId, userId, userRole);
        if (userRole === 'customer') {
            throw new common_1.ForbiddenException('Customers cannot delete booking images');
        }
        if (userRole === 'technician' && booking.technicianId !== userId) {
            throw new common_1.ForbiddenException('You can only delete images from your assigned bookings');
        }
        const [image] = await database_1.db
            .select()
            .from(database_1.schema.bookingImages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.bookingImages.id, imageId), (0, drizzle_orm_1.eq)(database_1.schema.bookingImages.bookingId, bookingId)));
        if (!image) {
            throw new common_1.NotFoundException(`Image with ID ${imageId} not found for booking ${bookingId}`);
        }
        const imagePath = this.supabaseService.extractPathFromUrl(image.url, 'booking-images');
        await this.supabaseService.deleteFile('booking-images', imagePath);
        await database_1.db.delete(database_1.schema.bookingImages).where((0, drizzle_orm_1.eq)(database_1.schema.bookingImages.id, imageId));
        return { message: 'Image deleted successfully' };
    }
    async uploadBookingImages(bookingId, files) {
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
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map