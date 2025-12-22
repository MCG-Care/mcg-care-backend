import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, ilike, or, and, sql, desc } from 'drizzle-orm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class ProductsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new product with images
   */
  async create(createProductDto: CreateProductDto, imageFiles: Express.Multer.File[]) {
    // Check if product model already exists
    const existingProduct = await db.query.products.findFirst({
      where: eq(schema.products.productModel, createProductDto.productModel),
    });

    if (existingProduct) {
      throw new BadRequestException(
        `Product with model "${createProductDto.productModel}" already exists`,
      );
    }

    // Insert product
    const [newProduct] = await db
      .insert(schema.products)
      .values({
        name: createProductDto.name,
        productModel: createProductDto.productModel,
        brand: createProductDto.brand,
        price: createProductDto.price?.toString(),
        description: createProductDto.description,
        capacity: createProductDto.capacity?.toString(),
        type: createProductDto.type,
        energyRating: createProductDto.energyRating,
        coolingPower: createProductDto.coolingPower,
        refrigerant: createProductDto.refrigerant,
        warranty: createProductDto.warranty,
        tagline: createProductDto.tagline,
        voltageAverage: createProductDto.voltageAverage,
        voltageCount: createProductDto.voltageCount,
        releaseDate: createProductDto.releaseDate,
      })
      .returning();

    // Upload images if provided
    let imageUrls: string[] = [];
    if (imageFiles && imageFiles.length > 0) {
      imageUrls = await this.uploadProductImages(newProduct.id, imageFiles);

      // Insert image records
      const imageRecords = imageUrls.map((url) => ({
        productId: newProduct.id,
        url,
      }));

      await db.insert(schema.productImages).values(imageRecords);
    }

    // Fetch complete product with images
    return this.findOne(newProduct.id);
  }

  /**
   * Find all products with pagination and filters
   */
  async findAll(query: QueryProductsDto) {
    const { search, type, brand, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(schema.products.name, `%${search}%`),
          ilike(schema.products.productModel, `%${search}%`),
          ilike(schema.products.brand, `%${search}%`),
        ),
      );
    }

    if (type) {
      conditions.push(eq(schema.products.type, type));
    }

    if (brand) {
      conditions.push(ilike(schema.products.brand, `%${brand}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.products)
      .where(whereClause);

    // Get products with images
    const products = await db.query.products.findMany({
      where: whereClause,
      with: {
        productImages: true,
      },
      limit,
      offset,
      orderBy: [desc(schema.products.createdAt)],
    });

    return {
      data: products,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Find a single product by ID
   */
  async findOne(id: number) {
    const product = await db.query.products.findFirst({
      where: eq(schema.products.id, id),
      with: {
        productImages: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Update a product
   */
  async update(id: number, updateProductDto: UpdateProductDto, imageFiles?: Express.Multer.File[]) {
    // Check if product exists
    const existingProduct = await this.findOne(id);

    // Check if product model is being changed and if it's unique
    if (
      updateProductDto.productModel &&
      updateProductDto.productModel !== existingProduct.productModel
    ) {
      const duplicateProduct = await db.query.products.findFirst({
        where: eq(schema.products.productModel, updateProductDto.productModel),
      });

      if (duplicateProduct) {
        throw new BadRequestException(
          `Product with model "${updateProductDto.productModel}" already exists`,
        );
      }
    }

    // Update product
    const [updatedProduct] = await db
      .update(schema.products)
      .set({
        ...updateProductDto,
        price: updateProductDto.price?.toString(),
        capacity: updateProductDto.capacity?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(schema.products.id, id))
      .returning();

    // Upload new images if provided
    if (imageFiles && imageFiles.length > 0) {
      const imageUrls = await this.uploadProductImages(id, imageFiles);

      // Insert new image records
      const imageRecords = imageUrls.map((url) => ({
        productId: id,
        url,
      }));

      await db.insert(schema.productImages).values(imageRecords);
    }

    // Fetch complete product with images
    return this.findOne(id);
  }

  /**
   * Delete a product
   */
  async remove(id: number) {
    const product = await this.findOne(id);

    // Delete all product images from storage
    if (product.productImages && product.productImages.length > 0) {
      const imagePaths = product.productImages.map((img) =>
        this.supabaseService.extractPathFromUrl(img.url, 'product-images'),
      );
      await this.supabaseService.deleteFiles('product-images', imagePaths);
    }

    // Delete product (cascade will delete images records)
    await db.delete(schema.products).where(eq(schema.products.id, id));

    return { message: 'Product deleted successfully' };
  }

  /**
   * Delete a specific product image
   */
  async removeImage(productId: number, imageId: number) {
    // Check if product exists
    await this.findOne(productId);

    // Find the image
    const [image] = await db
      .select()
      .from(schema.productImages)
      .where(
        and(eq(schema.productImages.id, imageId), eq(schema.productImages.productId, productId)),
      );

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found for product ${productId}`);
    }

    // Delete from storage
    const imagePath = this.supabaseService.extractPathFromUrl(image.url, 'product-images');
    await this.supabaseService.deleteFile('product-images', imagePath);

    // Delete from database
    await db.delete(schema.productImages).where(eq(schema.productImages.id, imageId));

    return { message: 'Image deleted successfully' };
  }

  /**
   * Upload product images to Supabase Storage
   */
  private async uploadProductImages(
    productId: number,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = file.originalname.split('.').pop();
      const filename = `product-${productId}-${timestamp}-${randomString}.${extension}`;
      const path = `products/${productId}/${filename}`;

      // Upload to Supabase
      return this.supabaseService.uploadFile('product-images', path, file.buffer, file.mimetype);
    });

    return Promise.all(uploadPromises);
  }
}
