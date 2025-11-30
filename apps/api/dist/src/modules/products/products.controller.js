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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const query_products_dto_1 = require("./dto/query-products.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    async create(createProductDto, files, user) {
        if (files && files.length > 0) {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            for (const file of files) {
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    throw new common_1.BadRequestException(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`);
                }
            }
        }
        return this.productsService.create(createProductDto, files);
    }
    async findAll(query) {
        return this.productsService.findAll(query);
    }
    async findOne(id) {
        return this.productsService.findOne(id);
    }
    async update(id, updateProductDto, files, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can update products');
        }
        if (files && files.length > 0) {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            for (const file of files) {
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    throw new common_1.BadRequestException(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`);
                }
            }
        }
        return this.productsService.update(id, updateProductDto, files);
    }
    async remove(id, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can delete products');
        }
        return this.productsService.remove(id);
    }
    async removeImage(productId, imageId, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can delete product images');
        }
        return this.productsService.removeImage(productId, imageId);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Array, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_products_dto_1.QueryProductsDto]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto, Array, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(':productId/images/:imageId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('imageId', common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "removeImage", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map