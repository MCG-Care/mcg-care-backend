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
const maintenance_reminders_service_1 = require("../maintenance-reminders/maintenance-reminders.service");
let BookingsService = class BookingsService {
    constructor(supabaseService, maintenanceRemindersService) {
        this.supabaseService = supabaseService;
        this.maintenanceRemindersService = maintenanceRemindersService;
    }
    async create(customerId, createBookingDto, imageFiles) {
        var _a;
        const { airconId, serviceIds, bookingForDate, bookingTime, description, addressId, promoCode } = createBookingDto;
        const aircon = await database_1.db.query.customerProducts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.id, airconId),
            with: {
                customer: {
                    with: {
                        primaryAddress: true,
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
        let customerDistrict;
        let bookingAddressId = null;
        if (addressId) {
            const selectedAddress = await database_1.db.query.addresses.findFirst({
                where: (0, drizzle_orm_1.eq)(database_1.schema.addresses.id, addressId),
            });
            if (!selectedAddress) {
                throw new common_1.NotFoundException(`Address with ID ${addressId} not found`);
            }
            if (selectedAddress.userId !== customerId) {
                throw new common_1.ForbiddenException('You can only use your own addresses for booking');
            }
            customerDistrict = selectedAddress.district;
            bookingAddressId = addressId;
        }
        else {
            const primaryAddress = (_a = aircon.customer) === null || _a === void 0 ? void 0 : _a.primaryAddress;
            if (!primaryAddress) {
                throw new common_1.BadRequestException('Customer address is required for booking. Please update your profile or provide an addressId.');
            }
            customerDistrict = primaryAddress.district;
        }
        const services = await database_1.db.query.serviceTypes.findMany({
            where: (0, drizzle_orm_1.inArray)(database_1.schema.serviceTypes.id, serviceIds),
        });
        if (services.length !== serviceIds.length) {
            throw new common_1.BadRequestException('One or more service IDs are invalid');
        }
        const serviceDuration = services.reduce((sum, service) => sum + service.duration, 0);
        let totalFees = services.reduce((sum, service) => sum + parseFloat(service.serviceFee), 0);
        let promoCodeId = null;
        if (promoCode) {
            try {
                let validatedPromoCode = null;
                let discountedServiceId = null;
                for (const service of services) {
                    try {
                        validatedPromoCode = await this.maintenanceRemindersService.validatePromoCode(promoCode, airconId, service.id);
                        discountedServiceId = service.id;
                        break;
                    }
                    catch (error) {
                        continue;
                    }
                }
                if (!validatedPromoCode || !discountedServiceId) {
                    throw new common_1.BadRequestException('Promo code is not valid for any of the selected services');
                }
                const discountedService = services.find((s) => s.id === discountedServiceId);
                if (discountedService) {
                    const serviceFee = parseFloat(discountedService.serviceFee);
                    const discount = (serviceFee * validatedPromoCode.discountPercentage) / 100;
                    totalFees -= discount;
                    promoCodeId = validatedPromoCode.id;
                }
            }
            catch (error) {
                throw new common_1.BadRequestException((error === null || error === void 0 ? void 0 : error.message) || 'Invalid promo code');
            }
        }
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
            addressId: bookingAddressId,
            promoCodeId: promoCodeId,
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
        if (promoCodeId) {
            await this.maintenanceRemindersService.markPromoCodeAsUsed(promoCodeId);
        }
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
                primaryAddress: true,
                technicianServices: {
                    with: {
                        service: true,
                    },
                },
            },
        });
        const techsInDistrict = technicians.filter((tech) => { var _a; return ((_a = tech.primaryAddress) === null || _a === void 0 ? void 0 : _a.district) === customerDistrict; });
        if (techsInDistrict.length === 0) {
            return null;
        }
        const techsWithServices = techsInDistrict.filter((tech) => {
            const techServiceIds = tech.technicianServices.map((ts) => ts.serviceId);
            return serviceIds.every((serviceId) => techServiceIds.includes(serviceId));
        });
        if (techsWithServices.length === 0) {
            return null;
        }
        const availabilityChecks = await Promise.all(techsWithServices.map(async (tech) => {
            const hasAvailability = await this.checkTechnicianAvailability(tech.id, bookingDate, startHour, requiredHours);
            return { tech, hasAvailability };
        }));
        const availableTechnicians = availabilityChecks
            .filter((check) => check.hasAvailability)
            .map((check) => check.tech);
        if (availableTechnicians.length === 0) {
            return null;
        }
        if (availableTechnicians.length === 1) {
            return availableTechnicians[0].id;
        }
        const shuffled = this.shuffleArray([...availableTechnicians]);
        return shuffled[0].id;
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
                        primaryAddress: true,
                    },
                },
                aircon: {
                    with: {
                        customer: {
                            with: {
                                primaryAddress: true,
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
            limit,
            offset,
            orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.bookings.createdAt)],
        });
        const bookingsWithAddress = await Promise.all(bookings.map(async (booking) => {
            var _a, _b;
            let serviceAddress = null;
            const bookingAddressId = booking.addressId;
            if (bookingAddressId) {
                const address = await database_1.db.query.addresses.findFirst({
                    where: (0, drizzle_orm_1.eq)(database_1.schema.addresses.id, bookingAddressId),
                });
                if (address) {
                    serviceAddress = {
                        id: address.id,
                        userId: address.userId,
                        name: address.name,
                        address: address.address,
                        township: address.township,
                        city: address.city,
                        district: address.district,
                        createdAt: address.createdAt,
                        updatedAt: address.updatedAt,
                    };
                }
            }
            if (!serviceAddress) {
                const primaryAddress = (_b = (_a = booking.aircon) === null || _a === void 0 ? void 0 : _a.customer) === null || _b === void 0 ? void 0 : _b.primaryAddress;
                if (primaryAddress) {
                    serviceAddress = {
                        id: primaryAddress.id,
                        userId: primaryAddress.userId,
                        name: primaryAddress.name,
                        address: primaryAddress.address,
                        township: primaryAddress.township,
                        city: primaryAddress.city,
                        district: primaryAddress.district,
                        createdAt: primaryAddress.createdAt,
                        updatedAt: primaryAddress.updatedAt,
                    };
                }
            }
            return Object.assign(Object.assign({}, booking), { serviceAddress });
        }));
        return {
            data: bookingsWithAddress,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        };
    }
    async findOne(id, userId, userRole) {
        var _a, _b;
        const booking = await database_1.db.query.bookings.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.bookings.id, id),
            with: {
                technician: {
                    with: {
                        primaryAddress: true,
                    },
                },
                aircon: {
                    with: {
                        customer: {
                            with: {
                                primaryAddress: true,
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
        let serviceAddress = null;
        const bookingAddressId = booking.addressId;
        if (bookingAddressId) {
            const address = await database_1.db.query.addresses.findFirst({
                where: (0, drizzle_orm_1.eq)(database_1.schema.addresses.id, bookingAddressId),
            });
            if (address) {
                serviceAddress = {
                    id: address.id,
                    userId: address.userId,
                    name: address.name,
                    address: address.address,
                    township: address.township,
                    city: address.city,
                    district: address.district,
                    createdAt: address.createdAt,
                    updatedAt: address.updatedAt,
                };
            }
        }
        if (!serviceAddress) {
            const primaryAddress = (_b = (_a = booking.aircon) === null || _a === void 0 ? void 0 : _a.customer) === null || _b === void 0 ? void 0 : _b.primaryAddress;
            if (primaryAddress) {
                serviceAddress = {
                    id: primaryAddress.id,
                    userId: primaryAddress.userId,
                    name: primaryAddress.name,
                    address: primaryAddress.address,
                    township: primaryAddress.township,
                    city: primaryAddress.city,
                    district: primaryAddress.district,
                    createdAt: primaryAddress.createdAt,
                    updatedAt: primaryAddress.updatedAt,
                };
            }
        }
        return Object.assign(Object.assign({}, booking), { serviceAddress });
    }
    async update(id, userId, userRole, updateBookingDto) {
        const booking = await this.findOne(id, userId, userRole);
        if (userRole === 'customer') {
            throw new common_1.ForbiddenException('Customers cannot update bookings');
        }
        if (userRole === 'technician' && booking.technicianId !== userId) {
            throw new common_1.ForbiddenException('You can only update your assigned bookings');
        }
        if (updateBookingDto.status === 'done') {
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
            const bookingDate = new Date(booking.bookingForDate);
            bookingDate.setHours(0, 0, 0, 0);
            if (bookingDate > today) {
                throw new common_1.BadRequestException(`Cannot mark booking as "done" before the scheduled date (${booking.bookingForDate}). The booking date must be today or in the past.`);
            }
            if (bookingDate.getTime() === today.getTime()) {
                const bookingTimeStr = booking.bookingTime || '09:00:00';
                const bookingHour = parseInt(bookingTimeStr.split(':')[0]);
                const currentHour = bangkokNow.getHours();
                const currentMinute = bangkokNow.getMinutes();
                if (bookingHour > currentHour) {
                    throw new common_1.BadRequestException(`Cannot mark booking as "done" before the scheduled time (${bookingTimeStr}). Current time in Bangkok is ${currentHour}:${currentMinute.toString().padStart(2, '0')}.`);
                }
            }
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
        if (updateBookingDto.status === 'done') {
            try {
                await this.maintenanceRemindersService.createRemindersForBooking(id);
            }
            catch (error) {
                console.error('Failed to create maintenance reminders:', error);
            }
        }
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
    async getAvailability(customerId, query) {
        var _a;
        const { airconId, serviceIds, addressId, date } = query;
        const aircon = await database_1.db.query.customerProducts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.id, airconId),
            with: {
                customer: {
                    with: {
                        primaryAddress: true,
                    },
                },
            },
        });
        if (!aircon) {
            throw new common_1.NotFoundException(`Aircon with ID ${airconId} not found`);
        }
        if (aircon.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only check availability for your own aircons');
        }
        let customerDistrict;
        if (addressId) {
            const selectedAddress = await database_1.db.query.addresses.findFirst({
                where: (0, drizzle_orm_1.eq)(database_1.schema.addresses.id, addressId),
            });
            if (!selectedAddress) {
                throw new common_1.NotFoundException(`Address with ID ${addressId} not found`);
            }
            if (selectedAddress.userId !== customerId) {
                throw new common_1.ForbiddenException('You can only use your own addresses for booking');
            }
            customerDistrict = selectedAddress.district;
        }
        else {
            if (!((_a = aircon.customer) === null || _a === void 0 ? void 0 : _a.primaryAddress)) {
                throw new common_1.BadRequestException('Customer address is required for checking availability. Please update your profile or provide an addressId.');
            }
            customerDistrict = aircon.customer.primaryAddress.district;
        }
        const services = await database_1.db.query.serviceTypes.findMany({
            where: (0, drizzle_orm_1.inArray)(database_1.schema.serviceTypes.id, serviceIds),
        });
        if (services.length !== serviceIds.length) {
            throw new common_1.BadRequestException('One or more service IDs are invalid');
        }
        const serviceDuration = services.reduce((sum, service) => sum + service.duration, 0);
        const serviceHours = Math.ceil(serviceDuration / 60);
        const technicians = await database_1.db.query.users.findMany({
            where: (0, drizzle_orm_1.eq)(database_1.schema.users.role, 'technician'),
            with: {
                primaryAddress: true,
                technicianServices: {
                    with: {
                        service: true,
                    },
                },
            },
        });
        const techsInDistrict = technicians.filter((tech) => { var _a; return ((_a = tech.primaryAddress) === null || _a === void 0 ? void 0 : _a.district) === customerDistrict; });
        if (techsInDistrict.length === 0) {
            return this.generateEmptyAvailability(date);
        }
        const techsWithServices = techsInDistrict.filter((tech) => {
            const techServiceIds = tech.technicianServices.map((ts) => ts.serviceId);
            return serviceIds.every((serviceId) => techServiceIds.includes(serviceId));
        });
        if (techsWithServices.length === 0) {
            return this.generateEmptyAvailability(date);
        }
        const technicianIds = techsWithServices.map((tech) => tech.id);
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
        const currentHour = bangkokNow.getHours();
        const currentMinute = bangkokNow.getMinutes();
        const dateFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        const bangkokDateParts = formatter.formatToParts(now);
        const year = bangkokDateParts.find(p => p.type === 'year').value;
        const month = bangkokDateParts.find(p => p.type === 'month').value;
        const day = bangkokDateParts.find(p => p.type === 'day').value;
        const finalTodayDateStr = `${year}-${month}-${day}`;
        if (date) {
            const normalizedDate = date.trim();
            const dateParts = normalizedDate.split('-');
            if (dateParts.length !== 3 || dateParts[0].length !== 4 || dateParts[1].length !== 2 || dateParts[2].length !== 2) {
                throw new common_1.BadRequestException('Invalid date format. Expected YYYY-MM-DD');
            }
            const requestedDateStr = normalizedDate;
            if (requestedDateStr < finalTodayDateStr) {
                throw new common_1.BadRequestException('Cannot check availability for past dates');
            }
            const maxDate = new Date(today);
            maxDate.setDate(maxDate.getDate() + 30);
            const maxDateStr = dateFormatter.format(maxDate);
            if (requestedDateStr > maxDateStr) {
                throw new common_1.BadRequestException('Cannot check availability more than 30 days in advance');
            }
            const isToday = requestedDateStr === finalTodayDateStr;
            const dayAvailability = await this.getAvailabilityForDate(technicianIds, requestedDateStr, serviceHours, isToday, currentHour);
            return [
                {
                    date: requestedDateStr,
                    availableSlots: dayAvailability,
                },
            ];
        }
        const availability = [];
        for (let i = 0; i <= 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const dateFormatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Bangkok',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
            const dateStr = dateFormatter.format(checkDate);
            const isToday = dateStr === finalTodayDateStr;
            const dayAvailability = await this.getAvailabilityForDate(technicianIds, dateStr, serviceHours, isToday, currentHour);
            availability.push({
                date: dateStr,
                availableSlots: dayAvailability,
            });
        }
        return availability;
    }
    async getAvailabilityForDate(technicianIds, dateStr, serviceHours, isToday, currentHour) {
        const timeslots = await database_1.db.query.timeslots.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(database_1.schema.timeslots.technicianId, technicianIds), (0, drizzle_orm_1.eq)(database_1.schema.timeslots.date, dateStr)),
        });
        const availableSlots = [];
        for (let hour = 9; hour <= 16; hour++) {
            if (isToday && hour <= currentHour) {
                continue;
            }
            const serviceEndTime = hour + serviceHours;
            if (serviceEndTime > 17) {
                continue;
            }
            const hasSlotForTraffic = serviceEndTime < 17;
            const requiredHours = hasSlotForTraffic ? serviceHours + 1 : serviceHours;
            const hasAvailability = timeslots.some((timeslot) => {
                if (!timeslot.slots || timeslot.slots.length === 0) {
                    return false;
                }
                const requiredSlots = Array.from({ length: requiredHours }, (_, i) => hour + i);
                return requiredSlots.every((slot) => timeslot.slots.includes(slot));
            });
            if (hasAvailability) {
                availableSlots.push(hour);
            }
        }
        return availableSlots;
    }
    generateEmptyAvailability(date) {
        if (date) {
            return [
                {
                    date,
                    availableSlots: [],
                },
            ];
        }
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
        const availability = [];
        for (let i = 0; i <= 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() + i);
            const dateFormatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Bangkok',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });
            const dateStr = dateFormatter.format(checkDate);
            availability.push({
                date: dateStr,
                availableSlots: [],
            });
        }
        return availability;
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
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        maintenance_reminders_service_1.MaintenanceRemindersService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map