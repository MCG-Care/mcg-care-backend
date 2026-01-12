"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProductsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
let CustomerProductsService = class CustomerProductsService {
    generateQRPayload(customerId, productId) {
        const timestamp = Date.now();
        const random = (0, crypto_1.randomBytes)(8).toString('hex');
        return `cp-${customerId}-${productId}-${timestamp}-${random}`;
    }
    async create(customerId, createCustomerProductDto) {
        const { productId, name, purchaseCode } = createCustomerProductDto;
        const product = await database_1.db.query.products.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.products.id, productId),
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${productId} not found`);
        }
        if (purchaseCode) {
            const existingProduct = await database_1.db.query.customerProducts.findFirst({
                where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.purchaseCode, purchaseCode),
            });
            if (existingProduct) {
                throw new common_1.BadRequestException(`Purchase code "${purchaseCode}" is already registered`);
            }
        }
        let qrUrl = null;
        let attempts = 0;
        const maxAttempts = 5;
        while (!qrUrl && attempts < maxAttempts) {
            const generatedQR = this.generateQRPayload(customerId, productId);
            const existingQR = await database_1.db.query.customerProducts.findFirst({
                where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.qrUrl, generatedQR),
            });
            if (!existingQR) {
                qrUrl = generatedQR;
            }
            attempts++;
        }
        if (!qrUrl) {
            throw new common_1.BadRequestException('Failed to generate unique QR code. Please try again.');
        }
        const purchaseDate = purchaseCode ? new Date().toISOString().split('T')[0] : null;
        const [newCustomerProduct] = await database_1.db
            .insert(database_1.schema.customerProducts)
            .values({
            customerId,
            productId,
            name,
            purchaseCode: purchaseCode || null,
            purchaseDate,
            qrUrl,
        })
            .returning();
        return this.findOne(newCustomerProduct.id, customerId, false);
    }
    async findAll(customerId, query) {
        const { page = 1, limit = 10, customerId: filterCustomerId } = query;
        const offset = (page - 1) * limit;
        const targetCustomerId = filterCustomerId || customerId;
        const whereCondition = targetCustomerId
            ? (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.customerId, targetCustomerId)
            : undefined;
        const [{ count }] = await database_1.db
            .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(database_1.schema.customerProducts)
            .where(whereCondition);
        const customerProducts = await database_1.db.query.customerProducts.findMany({
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
            orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.customerProducts.createdAt)],
        });
        const productsWithWarranty = customerProducts.map((cp) => {
            let warrantyEndDate = null;
            if (cp.purchaseDate && cp.product.warranty) {
                const purchaseDate = new Date(cp.purchaseDate);
                purchaseDate.setFullYear(purchaseDate.getFullYear() + cp.product.warranty);
                warrantyEndDate = purchaseDate.toISOString().split('T')[0];
            }
            return Object.assign(Object.assign({}, cp), { warrantyEndDate });
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
    async findOne(id, customerId, isAdmin = false) {
        const customerProduct = await database_1.db.query.customerProducts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.id, id),
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
            throw new common_1.NotFoundException(`Customer product with ID ${id} not found`);
        }
        if (!isAdmin && customerId && customerProduct.customerId !== customerId) {
            throw new common_1.ForbiddenException('You do not have permission to access this product');
        }
        let warrantyEndDate = null;
        if (customerProduct.purchaseDate && customerProduct.product.warranty) {
            const purchaseDate = new Date(customerProduct.purchaseDate);
            purchaseDate.setFullYear(purchaseDate.getFullYear() + customerProduct.product.warranty);
            warrantyEndDate = purchaseDate.toISOString().split('T')[0];
        }
        return Object.assign(Object.assign({}, customerProduct), { warrantyEndDate });
    }
    async findByQR(qrUrl) {
        const customerProduct = await database_1.db.query.customerProducts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.qrUrl, qrUrl),
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
                    orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.bookings.createdAt)],
                },
            },
        });
        if (!customerProduct) {
            throw new common_1.NotFoundException(`Product with QR code not found`);
        }
        let warrantyEndDate = null;
        if (customerProduct.purchaseDate && customerProduct.product.warranty) {
            const purchaseDate = new Date(customerProduct.purchaseDate);
            purchaseDate.setFullYear(purchaseDate.getFullYear() + customerProduct.product.warranty);
            warrantyEndDate = purchaseDate.toISOString().split('T')[0];
        }
        return Object.assign(Object.assign({}, customerProduct), { warrantyEndDate });
    }
    async update(id, customerId, updateCustomerProductDto) {
        const existingProduct = await this.findOne(id, customerId, false);
        const updateData = {
            updatedAt: new Date(),
        };
        if (updateCustomerProductDto.name) {
            updateData.name = updateCustomerProductDto.name;
        }
        if (updateCustomerProductDto.purchaseCode &&
            updateCustomerProductDto.purchaseCode !== existingProduct.purchaseCode) {
            if (existingProduct.purchaseCode) {
                throw new common_1.BadRequestException('Cannot change an existing purchase code');
            }
            const duplicateProduct = await database_1.db.query.customerProducts.findFirst({
                where: (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.purchaseCode, updateCustomerProductDto.purchaseCode),
            });
            if (duplicateProduct) {
                throw new common_1.BadRequestException(`Purchase code "${updateCustomerProductDto.purchaseCode}" is already registered`);
            }
            updateData.purchaseCode = updateCustomerProductDto.purchaseCode;
            updateData.purchaseDate = new Date().toISOString().split('T')[0];
        }
        const [updatedProduct] = await database_1.db
            .update(database_1.schema.customerProducts)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.customerProducts.id, id), (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.customerId, customerId)))
            .returning();
        return this.findOne(updatedProduct.id, customerId, false);
    }
    async remove(id, customerId) {
        await this.findOne(id, customerId, false);
        await database_1.db
            .delete(database_1.schema.customerProducts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.customerProducts.id, id), (0, drizzle_orm_1.eq)(database_1.schema.customerProducts.customerId, customerId)));
        return { message: 'Customer product deleted successfully' };
    }
};
exports.CustomerProductsService = CustomerProductsService;
exports.CustomerProductsService = CustomerProductsService = __decorate([
    (0, common_1.Injectable)()
], CustomerProductsService);
//# sourceMappingURL=customer-products.service.js.map