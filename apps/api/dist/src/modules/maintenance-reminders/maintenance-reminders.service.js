"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceRemindersService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
let MaintenanceRemindersService = class MaintenanceRemindersService {
    async getActiveReminders(customerId) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        const oneMonthLaterStr = oneMonthLater.toISOString().split('T')[0];
        const reminders = await database_1.db.query.maintenanceReminders.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.maintenanceReminders.customerId, customerId), (0, drizzle_orm_1.gte)(database_1.schema.maintenanceReminders.reminderDate, todayStr), (0, drizzle_orm_1.lte)(database_1.schema.maintenanceReminders.reminderDate, oneMonthLaterStr)),
            with: {
                customerProduct: {
                    with: {
                        product: true,
                    },
                },
                serviceType: true,
                promotionCode: true,
            },
            orderBy: (reminders, { asc }) => [asc(reminders.reminderDate)],
        });
        const activeReminders = reminders.filter((reminder) => {
            const promoCode = reminder.promotionCode;
            if (!promoCode)
                return false;
            if (promoCode.isUsed)
                return false;
            const expiresAt = new Date(promoCode.expiresAt);
            const todayDate = new Date(todayStr);
            if (expiresAt < todayDate)
                return false;
            return true;
        });
        return activeReminders;
    }
    generatePromoCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    async generateUniquePromoCode() {
        let code = this.generatePromoCode();
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            const existing = await database_1.db.query.promotionCodes.findFirst({
                where: (0, drizzle_orm_1.eq)(database_1.schema.promotionCodes.code, code),
            });
            if (!existing) {
                return code;
            }
            code = this.generatePromoCode();
            attempts++;
        }
        return `${code}${Date.now().toString().slice(-4)}`;
    }
    generateDiscountPercentage() {
        return Math.floor(Math.random() * 11) + 5;
    }
    calculateReminderDate(serviceTypeId, fromDate) {
        const reminderDate = new Date(fromDate);
        if (serviceTypeId === 1 || serviceTypeId === 6) {
            reminderDate.setMonth(reminderDate.getMonth() + 6);
        }
        else if (serviceTypeId === 5 || serviceTypeId === 7) {
            reminderDate.setFullYear(reminderDate.getFullYear() + 1);
        }
        else {
            reminderDate.setMonth(reminderDate.getMonth() + 6);
        }
        return reminderDate.toISOString().split('T')[0];
    }
    async createRemindersForBooking(bookingId) {
        const booking = await database_1.db.query.bookings.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.bookings.id, bookingId),
            with: {
                aircon: {
                    with: {
                        customer: true,
                    },
                },
                bookingServices: {
                    with: {
                        service: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new Error(`Booking with ID ${bookingId} not found`);
        }
        const completionDate = new Date();
        const targetServiceTypes = [1, 5, 6, 7];
        const relevantServices = booking.bookingServices.filter((bs) => targetServiceTypes.includes(bs.serviceId));
        if (relevantServices.length === 0) {
            return [];
        }
        const customerId = booking.aircon.customerId;
        const customerProductId = booking.airconId;
        const createdReminders = [];
        for (const bookingService of relevantServices) {
            const serviceTypeId = bookingService.serviceId;
            const promoCode = await this.generateUniquePromoCode();
            const discountPercentage = this.generateDiscountPercentage();
            const reminderDate = this.calculateReminderDate(serviceTypeId, completionDate);
            const [createdPromoCode] = await database_1.db
                .insert(database_1.schema.promotionCodes)
                .values({
                customerProductId,
                serviceTypeId,
                code: promoCode,
                discountPercentage,
                expiresAt: reminderDate,
                isUsed: false,
            })
                .returning();
            const [createdReminder] = await database_1.db
                .insert(database_1.schema.maintenanceReminders)
                .values({
                customerId,
                customerProductId,
                serviceTypeId,
                promotionCodeId: createdPromoCode.id,
                reminderDate,
            })
                .returning();
            createdReminders.push({
                reminder: createdReminder,
                promoCode: createdPromoCode,
            });
        }
        return createdReminders;
    }
    async validatePromoCode(code, customerProductId, serviceTypeId) {
        const promoCode = await database_1.db.query.promotionCodes.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.promotionCodes.code, code),
        });
        if (!promoCode) {
            throw new Error('Invalid promo code');
        }
        if (promoCode.isUsed) {
            throw new Error('Promo code has already been used');
        }
        const today = new Date().toISOString().split('T')[0];
        if (promoCode.expiresAt < today) {
            throw new Error('Promo code has expired');
        }
        if (promoCode.customerProductId !== customerProductId) {
            throw new Error('Promo code is not valid for this aircon');
        }
        if (promoCode.serviceTypeId !== serviceTypeId) {
            throw new Error('Promo code is not valid for this service type');
        }
        return promoCode;
    }
    async markPromoCodeAsUsed(promoCodeId) {
        await database_1.db
            .update(database_1.schema.promotionCodes)
            .set({
            isUsed: true,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(database_1.schema.promotionCodes.id, promoCodeId));
    }
};
exports.MaintenanceRemindersService = MaintenanceRemindersService;
exports.MaintenanceRemindersService = MaintenanceRemindersService = __decorate([
    (0, common_1.Injectable)()
], MaintenanceRemindersService);
//# sourceMappingURL=maintenance-reminders.service.js.map