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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
const supabase_service_1 = require("../../config/supabase.service");
let ProductsService = class ProductsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createProductDto, imageFiles) {
        var _a, _b;
        const existingProduct = await database_1.db.query.products.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.products.productModel, createProductDto.productModel),
        });
        if (existingProduct) {
            throw new common_1.BadRequestException(`Product with model "${createProductDto.productModel}" already exists`);
        }
        const [newProduct] = await database_1.db
            .insert(database_1.schema.products)
            .values({
            name: createProductDto.name,
            productModel: createProductDto.productModel,
            brand: createProductDto.brand,
            price: (_a = createProductDto.price) === null || _a === void 0 ? void 0 : _a.toString(),
            description: createProductDto.description,
            capacity: (_b = createProductDto.capacity) === null || _b === void 0 ? void 0 : _b.toString(),
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
        let imageUrls = [];
        if (imageFiles && imageFiles.length > 0) {
            imageUrls = await this.uploadProductImages(newProduct.id, imageFiles);
            const imageRecords = imageUrls.map((url) => ({
                productId: newProduct.id,
                url,
            }));
            await database_1.db.insert(database_1.schema.productImages).values(imageRecords);
        }
        return this.findOne(newProduct.id);
    }
    async findAll(query) {
        const { search, type, brand, page = 1, limit = 30 } = query;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(database_1.schema.products.name, `%${search}%`), (0, drizzle_orm_1.ilike)(database_1.schema.products.productModel, `%${search}%`), (0, drizzle_orm_1.ilike)(database_1.schema.products.brand, `%${search}%`)));
        }
        if (type) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.products.type, type));
        }
        if (brand) {
            conditions.push((0, drizzle_orm_1.ilike)(database_1.schema.products.brand, `%${brand}%`));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const [{ count }] = await database_1.db
            .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(database_1.schema.products)
            .where(whereClause);
        const products = await database_1.db.query.products.findMany({
            where: whereClause,
            with: {
                productImages: true,
            },
            limit,
            offset,
            orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.products.createdAt)],
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
    async findOne(id) {
        const product = await database_1.db.query.products.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.products.id, id),
            with: {
                productImages: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async update(id, updateProductDto, imageFiles) {
        var _a, _b;
        const existingProduct = await this.findOne(id);
        if (updateProductDto.productModel &&
            updateProductDto.productModel !== existingProduct.productModel) {
            const duplicateProduct = await database_1.db.query.products.findFirst({
                where: (0, drizzle_orm_1.eq)(database_1.schema.products.productModel, updateProductDto.productModel),
            });
            if (duplicateProduct) {
                throw new common_1.BadRequestException(`Product with model "${updateProductDto.productModel}" already exists`);
            }
        }
        const [updatedProduct] = await database_1.db
            .update(database_1.schema.products)
            .set(Object.assign(Object.assign({}, updateProductDto), { price: (_a = updateProductDto.price) === null || _a === void 0 ? void 0 : _a.toString(), capacity: (_b = updateProductDto.capacity) === null || _b === void 0 ? void 0 : _b.toString(), updatedAt: new Date() }))
            .where((0, drizzle_orm_1.eq)(database_1.schema.products.id, id))
            .returning();
        if (imageFiles && imageFiles.length > 0) {
            const imageUrls = await this.uploadProductImages(id, imageFiles);
            const imageRecords = imageUrls.map((url) => ({
                productId: id,
                url,
            }));
            await database_1.db.insert(database_1.schema.productImages).values(imageRecords);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const product = await this.findOne(id);
        if (product.productImages && product.productImages.length > 0) {
            const imagePaths = product.productImages.map((img) => this.supabaseService.extractPathFromUrl(img.url, 'product-images'));
            await this.supabaseService.deleteFiles('product-images', imagePaths);
        }
        await database_1.db.delete(database_1.schema.products).where((0, drizzle_orm_1.eq)(database_1.schema.products.id, id));
        return { message: 'Product deleted successfully' };
    }
    async removeImage(productId, imageId) {
        await this.findOne(productId);
        const [image] = await database_1.db
            .select()
            .from(database_1.schema.productImages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.productImages.id, imageId), (0, drizzle_orm_1.eq)(database_1.schema.productImages.productId, productId)));
        if (!image) {
            throw new common_1.NotFoundException(`Image with ID ${imageId} not found for product ${productId}`);
        }
        const imagePath = this.supabaseService.extractPathFromUrl(image.url, 'product-images');
        await this.supabaseService.deleteFile('product-images', imagePath);
        await database_1.db.delete(database_1.schema.productImages).where((0, drizzle_orm_1.eq)(database_1.schema.productImages.id, imageId));
        return { message: 'Image deleted successfully' };
    }
    async uploadProductImages(productId, files) {
        const uploadPromises = files.map(async (file) => {
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(7);
            const extension = file.originalname.split('.').pop();
            const filename = `product-${productId}-${timestamp}-${randomString}.${extension}`;
            const path = `products/${productId}/${filename}`;
            return this.supabaseService.uploadFile('product-images', path, file.buffer, file.mimetype);
        });
        return Promise.all(uploadPromises);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ProductsService);
//# sourceMappingURL=products.service.js.map