export declare class MaintenanceRemindersService {
    getActiveReminders(customerId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        customerProductId: number;
        serviceTypeId: number;
        promotionCodeId: number;
        reminderDate: string;
        customerProduct: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        serviceType: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        promotionCode: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }[]>;
    generatePromoCode(): string;
    generateUniquePromoCode(): Promise<string>;
    generateDiscountPercentage(): number;
    calculateReminderDate(reminderIntervalMonths: number, fromDate: Date): string;
    createRemindersForBooking(bookingId: number): Promise<{
        reminder: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            customerId: number;
            customerProductId: number;
            serviceTypeId: number;
            promotionCodeId: number;
            reminderDate: string;
        };
        promoCode: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            customerProductId: number;
            serviceTypeId: number;
            code: string;
            discountPercentage: number;
            expiresAt: string;
            isUsed: boolean;
        };
    }[]>;
    validatePromoCode(code: string, customerProductId: number, serviceTypeId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        customerProductId: number;
        serviceTypeId: number;
        code: string;
        discountPercentage: number;
        expiresAt: string;
        isUsed: boolean;
    }>;
    markPromoCodeAsUsed(promoCodeId: number): Promise<void>;
}
