import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class PromotionCodesService {
  /**
   * Get promo code details by ID
   * Returns only the flat promo code fields for the customer iOS app.
   * Accessible by: related customer, assigned technicians, and admins.
   */
  async findOne(id: number, userId: number, userRole: string) {
    const result = await db.query.promotionCodes.findFirst({
      where: eq(schema.promotionCodes.id, id),
      with: {
        customerProduct: {
          columns: { customerId: true },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Promotion code with ID ${id} not found`);
    }

    const customerProduct = result.customerProduct as { customerId: number };
    const customerProductId = (result as any).customerProductId;

    // Admin can view any promo code
    if (userRole === 'admin') {
      const { customerProduct: _, ...promoCode } = result;
      return promoCode;
    }

    // Customer can view their own (aircon owner)
    if (userRole === 'customer') {
      if (customerProduct?.customerId === userId) {
        const { customerProduct: _, ...promoCode } = result;
        return promoCode;
      }
      throw new ForbiddenException('You can only view your own promotion codes');
    }

    // Technician can view if they have a booking for this aircon
    if (userRole === 'technician') {
      const technicianBooking = await db.query.bookings.findFirst({
        where: and(
          eq(schema.bookings.airconId, customerProductId),
          eq(schema.bookings.technicianId, userId),
        ),
      });
      if (technicianBooking) {
        const { customerProduct: _, ...promoCode } = result;
        return promoCode;
      }
      throw new ForbiddenException(
        'You can only view promotion codes for aircons you have been assigned to',
      );
    }

    throw new ForbiddenException('You do not have access to this promotion code');
  }
}
