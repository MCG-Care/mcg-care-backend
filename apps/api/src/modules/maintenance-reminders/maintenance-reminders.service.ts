import { Injectable } from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and, gte, lte } from 'drizzle-orm';

@Injectable()
export class MaintenanceRemindersService {
  /**
   * Get active reminders for a customer within the next month
   */
  async getActiveReminders(customerId: number) {
    // Get today's date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Calculate date one month from now
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const oneMonthLaterStr = oneMonthLater.toISOString().split('T')[0];

    // Fetch reminders within the date range
    const reminders = await db.query.maintenanceReminders.findMany({
      where: and(
        eq(schema.maintenanceReminders.customerId, customerId),
        gte(schema.maintenanceReminders.reminderDate, todayStr),
        lte(schema.maintenanceReminders.reminderDate, oneMonthLaterStr),
      ),
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

    // Filter out reminders with used or expired promo codes
    const activeReminders = reminders.filter((reminder) => {
      const promoCode = (reminder as any).promotionCode;
      if (!promoCode) return false;
      
      // Check if promo code is not used
      if (promoCode.isUsed) return false;
      
      // Check if promo code is not expired
      const expiresAt = new Date(promoCode.expiresAt);
      const todayDate = new Date(todayStr);
      if (expiresAt < todayDate) return false;
      
      return true;
    });

    return activeReminders;
  }

  /**
   * Generate promo code (random alphanumeric, 8 characters)
   */
  generatePromoCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Generate a unique promo code (checks database for uniqueness)
   */
  async generateUniquePromoCode(): Promise<string> {
    let code = this.generatePromoCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await db.query.promotionCodes.findFirst({
        where: eq(schema.promotionCodes.code, code),
      });

      if (!existing) {
        return code;
      }

      code = this.generatePromoCode();
      attempts++;
    }

    // If still not unique after max attempts, add timestamp
    return `${code}${Date.now().toString().slice(-4)}`;
  }

  /**
   * Generate random discount percentage between 5-15%
   */
  generateDiscountPercentage(): number {
    return Math.floor(Math.random() * 11) + 5; // Random number between 5 and 15
  }

  /**
   * Calculate reminder date based on service type
   * Service types 1 and 6: 6 months from now
   * Service types 5 and 7: 1 year from now
   */
  calculateReminderDate(serviceTypeId: number, fromDate: Date): string {
    const reminderDate = new Date(fromDate);

    if (serviceTypeId === 1 || serviceTypeId === 6) {
      // Add 6 months
      reminderDate.setMonth(reminderDate.getMonth() + 6);
    } else if (serviceTypeId === 5 || serviceTypeId === 7) {
      // Add 1 year
      reminderDate.setFullYear(reminderDate.getFullYear() + 1);
    } else {
      // For other service types, default to 6 months
      reminderDate.setMonth(reminderDate.getMonth() + 6);
    }

    return reminderDate.toISOString().split('T')[0];
  }

  /**
   * Create promotion codes and reminders for a completed booking
   * Called when booking status changes to "done"
   */
  async createRemindersForBooking(bookingId: number) {
    // Fetch the booking with all related data
    const booking = await db.query.bookings.findFirst({
      where: eq(schema.bookings.id, bookingId),
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

    // Get the date when booking was marked as done (use current date)
    const completionDate = new Date();

    // Filter service types to only include 1, 5, 6, 7
    const targetServiceTypes = [1, 5, 6, 7];
    const relevantServices = (booking.bookingServices as any[]).filter((bs) =>
      targetServiceTypes.includes(bs.serviceId),
    );

    if (relevantServices.length === 0) {
      // No relevant services for reminders
      return [];
    }

    const customerId = (booking.aircon as any).customerId;
    const customerProductId = (booking as any).airconId;

    const createdReminders = [];

    // Create a promo code and reminder for each relevant service
    for (const bookingService of relevantServices) {
      const serviceTypeId = bookingService.serviceId;

      // Generate unique promo code
      const promoCode = await this.generateUniquePromoCode();
      const discountPercentage = this.generateDiscountPercentage();

      // Calculate reminder date
      const reminderDate = this.calculateReminderDate(
        serviceTypeId,
        completionDate,
      );

      // Create promotion code
      const [createdPromoCode] = await db
        .insert(schema.promotionCodes)
        .values({
          customerProductId,
          serviceTypeId,
          code: promoCode,
          discountPercentage,
          expiresAt: reminderDate, // Promo code expires on reminder date
          isUsed: false,
        })
        .returning();

      // Create maintenance reminder
      const [createdReminder] = await db
        .insert(schema.maintenanceReminders)
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

  /**
   * Validate and retrieve a promo code for booking
   */
  async validatePromoCode(
    code: string,
    customerProductId: number,
    serviceTypeId: number,
  ) {
    const promoCode = await db.query.promotionCodes.findFirst({
      where: eq(schema.promotionCodes.code, code),
    });

    if (!promoCode) {
      throw new Error('Invalid promo code');
    }

    // Check if already used
    if (promoCode.isUsed) {
      throw new Error('Promo code has already been used');
    }

    // Check if expired
    const today = new Date().toISOString().split('T')[0];
    if (promoCode.expiresAt < today) {
      throw new Error('Promo code has expired');
    }

    // Check if it matches the customer product
    if (promoCode.customerProductId !== customerProductId) {
      throw new Error('Promo code is not valid for this aircon');
    }

    // Check if it matches the service type
    if (promoCode.serviceTypeId !== serviceTypeId) {
      throw new Error('Promo code is not valid for this service type');
    }

    return promoCode;
  }

  /**
   * Mark a promo code as used
   */
  async markPromoCodeAsUsed(promoCodeId: number) {
    await db
      .update(schema.promotionCodes)
      .set({
        isUsed: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.promotionCodes.id, promoCodeId));
  }
}
