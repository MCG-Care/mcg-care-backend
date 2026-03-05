import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and, or, ilike, sql, desc, inArray } from 'drizzle-orm';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';
import { QueryCustomerProductsDto } from './dto/query-customer-products.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class CustomerProductsService {
  /**
   * Generate a unique QR code payload/URL
   * This will be a unique identifier that can be used to generate QR codes
   */
  private generateQRPayload(customerId: number, productId: number): string {
    // Generate a unique payload using customer ID, product ID, timestamp, and random bytes
    const timestamp = Date.now();
    const random = randomBytes(8).toString('hex');
    // Format: customer-product-timestamp-random
    return `cp-${customerId}-${productId}-${timestamp}-${random}`;
  }

  /**
   * Register a new customer product (aircon)
   */
  async create(customerId: number, createCustomerProductDto: CreateCustomerProductDto) {
    const { productId, name, purchaseCode } = createCustomerProductDto;

    // Check if product exists
    const product = await db.query.products.findFirst({
      where: eq(schema.products.id, productId),
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if purchase code is already used (if provided)
    if (purchaseCode) {
      const existingProduct = await db.query.customerProducts.findFirst({
        where: eq(schema.customerProducts.purchaseCode, purchaseCode),
      });

      if (existingProduct) {
        throw new BadRequestException(`Purchase code "${purchaseCode}" is already registered`);
      }
    }

    // Generate unique QR payload
    let qrUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure QR URL is unique
    while (!qrUrl && attempts < maxAttempts) {
      const generatedQR = this.generateQRPayload(customerId, productId);
      const existingQR = await db.query.customerProducts.findFirst({
        where: eq(schema.customerProducts.qrUrl, generatedQR),
      });

      if (!existingQR) {
        qrUrl = generatedQR;
      }
      attempts++;
    }

    if (!qrUrl) {
      throw new BadRequestException('Failed to generate unique QR code. Please try again.');
    }

    // Determine purchase date: if purchase code is provided, use current date; otherwise null
    const purchaseDate = purchaseCode ? new Date().toISOString().split('T')[0] : null;

    // Insert customer product
    const [newCustomerProduct] = await db
      .insert(schema.customerProducts)
      .values({
        customerId,
        productId,
        name,
        purchaseCode: purchaseCode || null,
        purchaseDate,
        qrUrl,
      })
      .returning();

    // Fetch complete product with relations
    return this.findOne(newCustomerProduct.id, customerId, false);
  }

  /**
   * Find all customer products for a specific customer
   * Admin can search by serial number (last part of qrUrl), customer name, or email
   */
  async findAll(customerId: number | undefined, query: QueryCustomerProductsDto) {
    const {
      page = 1,
      limit = 30,
      customerId: filterCustomerId,
      search,
    } = query;
    const offset = (page - 1) * limit;

    // Determine which customerId to use: filterCustomerId (admin) or customerId (customer)
    const targetCustomerId = filterCustomerId || customerId;

    // Build base where condition
    let whereCondition = targetCustomerId
      ? eq(schema.customerProducts.customerId, targetCustomerId)
      : undefined;

    // For admin view (no targetCustomerId), add search filter when provided
    if (!targetCustomerId && search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      // Get IDs of customer products matching search (serial/qrUrl, customer name, email)
      const matchingRows = await db
        .select({ id: schema.customerProducts.id })
        .from(schema.customerProducts)
        .leftJoin(
          schema.users,
          eq(schema.customerProducts.customerId, schema.users.id),
        )
        .where(
          or(
            ilike(schema.customerProducts.qrUrl, searchTerm),
            ilike(schema.users.name, searchTerm),
            ilike(schema.users.email, searchTerm),
            ilike(schema.users.phoneNo, searchTerm),
          ),
        );
      const matchingIds = matchingRows.map((r) => r.id);
      if (matchingIds.length === 0) {
        // No matches, return empty result
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
      whereCondition = whereCondition
        ? and(
            whereCondition,
            inArray(schema.customerProducts.id, matchingIds),
          )
        : inArray(schema.customerProducts.id, matchingIds);
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.customerProducts)
      .where(whereCondition);

    // Get customer products with relations
    const customerProducts = await db.query.customerProducts.findMany({
      where: whereCondition,
      with: {
        product: {
          with: {
            productImages: true,
          },
        },
        customer: {
          with: {
            primaryAddress: true,
          },
        },
      },
      limit,
      offset,
      orderBy: [desc(schema.customerProducts.createdAt)],
    });

    // Calculate warranty end date for each product
    const productsWithWarranty = customerProducts.map((cp) => {
      let warrantyEndDate: string | null = null;
      if (cp.purchaseDate && (cp.product as any).warranty) {
        const purchaseDate = new Date(cp.purchaseDate);
        purchaseDate.setFullYear(purchaseDate.getFullYear() + (cp.product as any).warranty);
        warrantyEndDate = purchaseDate.toISOString().split('T')[0];
      }

      return {
        ...cp,
        warrantyEndDate,
      };
    });

    return {
      data: productsWithWarranty,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Find a single customer product by ID
   * @param id - Customer product ID
   * @param customerId - Customer ID (for ownership check, undefined for admin)
   * @param isAdmin - Whether the requester is an admin
   */
  async findOne(id: number, customerId?: number, isAdmin: boolean = false) {
    const customerProduct = await db.query.customerProducts.findFirst({
      where: eq(schema.customerProducts.id, id),
      with: {
        product: {
          with: {
            productImages: true,
          },
        },
        customer: {
          with: {
            primaryAddress: true,
          },
        },
      },
    });

    if (!customerProduct) {
      throw new NotFoundException(`Customer product with ID ${id} not found`);
    }

    // Check if the customer owns this product (skip check for admin)
    if (!isAdmin && customerId && customerProduct.customerId !== customerId) {
      throw new ForbiddenException('You do not have permission to access this product');
    }

    // Calculate warranty end date
    let warrantyEndDate: string | null = null;
    if (customerProduct.purchaseDate && (customerProduct.product as any).warranty) {
      const purchaseDate = new Date(customerProduct.purchaseDate);
      purchaseDate.setFullYear(purchaseDate.getFullYear() + (customerProduct.product as any).warranty);
      warrantyEndDate = purchaseDate.toISOString().split('T')[0];
    }

    return {
      ...customerProduct,
      warrantyEndDate,
    };
  }

  /**
   * Find a customer product by QR URL (for technician scanning)
   */
  async findByQR(qrUrl: string) {
    const customerProduct = await db.query.customerProducts.findFirst({
      where: eq(schema.customerProducts.qrUrl, qrUrl),
      with: {
        product: {
          with: {
            productImages: true,
          },
        },
        customer: {
          with: {
            primaryAddress: true,
          },
        },
        bookings: {
          with: {
            bookingServices: {
              with: {
                service: true,
              },
            },
            serviceLog: true,
            feedback: true,
          },
          orderBy: [desc(schema.bookings.createdAt)],
        },
      },
    });

    if (!customerProduct) {
      throw new NotFoundException(`Product with QR code not found`);
    }

    // Calculate warranty end date
    let warrantyEndDate: string | null = null;
    if (customerProduct.purchaseDate && (customerProduct.product as any).warranty) {
      const purchaseDate = new Date(customerProduct.purchaseDate);
      purchaseDate.setFullYear(purchaseDate.getFullYear() + (customerProduct.product as any).warranty);
      warrantyEndDate = purchaseDate.toISOString().split('T')[0];
    }

    return {
      ...customerProduct,
      warrantyEndDate,
    };
  }

  /**
   * Update a customer product
   */
  async update(id: number, customerId: number, updateCustomerProductDto: UpdateCustomerProductDto) {
    // Check if customer product exists and belongs to customer
    const existingProduct = await this.findOne(id, customerId, false);

    const updateData: any = {
      updatedAt: new Date(),
    };

    // Allow updating nickname
    if (updateCustomerProductDto.name) {
      updateData.name = updateCustomerProductDto.name;
    }

    // If purchase code is being added (not changed), check if it's already used
    if (
      updateCustomerProductDto.purchaseCode &&
      updateCustomerProductDto.purchaseCode !== existingProduct.purchaseCode
    ) {
      // Don't allow changing an existing purchase code
      if (existingProduct.purchaseCode) {
        throw new BadRequestException('Cannot change an existing purchase code');
      }

      // Check if the new purchase code is already used
      const duplicateProduct = await db.query.customerProducts.findFirst({
        where: eq(schema.customerProducts.purchaseCode, updateCustomerProductDto.purchaseCode),
      });

      if (duplicateProduct) {
        throw new BadRequestException(
          `Purchase code "${updateCustomerProductDto.purchaseCode}" is already registered`,
        );
      }

      // If purchase code is being added for the first time, set purchase date to today
      updateData.purchaseCode = updateCustomerProductDto.purchaseCode;
      updateData.purchaseDate = new Date().toISOString().split('T')[0];
    }

    // Update customer product
    const [updatedProduct] = await db
      .update(schema.customerProducts)
      .set(updateData)
      .where(
        and(eq(schema.customerProducts.id, id), eq(schema.customerProducts.customerId, customerId)),
      )
      .returning();

    // Fetch complete product with relations
    return this.findOne(updatedProduct.id, customerId, false);
  }

  /**
   * Delete a customer product
   */
  async remove(id: number, customerId: number) {
    // Check if customer product exists and belongs to customer
    await this.findOne(id, customerId, false);

    // Delete customer product (cascade will handle related bookings)
    await db
      .delete(schema.customerProducts)
      .where(
        and(eq(schema.customerProducts.id, id), eq(schema.customerProducts.customerId, customerId)),
      );

    return { message: 'Customer product deleted successfully' };
  }
}
