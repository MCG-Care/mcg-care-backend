import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class PromotionCodesService {
  /**
   * Get promo code details by ID
   * Returns only the flat promo code fields for the customer iOS app.
   */
  async findOne(id: number, customerId: number) {
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

    // Only the customer who owns the aircon can view their promo code
    const customerProduct = result.customerProduct as { customerId: number };
    if (customerProduct?.customerId !== customerId) {
      throw new ForbiddenException('You can only view your own promotion codes');
    }

    // Return only the flat promo code fields
    const { customerProduct: _, ...promoCode } = result;
    return promoCode;
  }
}
