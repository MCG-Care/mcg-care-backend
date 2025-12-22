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
exports.CustomerProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const customer_products_service_1 = require("./customer-products.service");
const create_customer_product_dto_1 = require("./dto/create-customer-product.dto");
const update_customer_product_dto_1 = require("./dto/update-customer-product.dto");
const query_customer_products_dto_1 = require("./dto/query-customer-products.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let CustomerProductsController = class CustomerProductsController {
    constructor(customerProductsService) {
        this.customerProductsService = customerProductsService;
    }
    async create(createCustomerProductDto, user) {
        if (user.role !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can register products');
        }
        return this.customerProductsService.create(user.id, createCustomerProductDto);
    }
    async findAll(query, user) {
        if (user.role !== 'customer' && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only customers and admins can view customer products');
        }
        const customerId = user.role === 'customer' ? user.id : undefined;
        return this.customerProductsService.findAll(customerId, query);
    }
    async findByQR(qrUrl, user) {
        if (user.role !== 'technician' && user.role !== 'admin' && user.role !== 'customer') {
            throw new common_1.ForbiddenException('Only technicians, admins, and customers can scan QR codes');
        }
        const product = await this.customerProductsService.findByQR(qrUrl);
        if (user.role === 'customer' && product.customerId !== user.id) {
            throw new common_1.ForbiddenException('You can only view your own products');
        }
        return product;
    }
    async findOne(id, user) {
        if (user.role !== 'customer' && user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only customers and admins can view customer products');
        }
        const customerId = user.role === 'customer' ? user.id : undefined;
        const isAdmin = user.role === 'admin';
        return this.customerProductsService.findOne(id, customerId, isAdmin);
    }
    async update(id, updateCustomerProductDto, user) {
        if (user.role !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can update their products');
        }
        return this.customerProductsService.update(id, user.id, updateCustomerProductDto);
    }
    async remove(id, user) {
        if (user.role !== 'customer') {
            throw new common_1.ForbiddenException('Only customers can delete their products');
        }
        return this.customerProductsService.remove(id, user.id);
    }
};
exports.CustomerProductsController = CustomerProductsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register customer product (Customer only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_product_dto_1.CreateCustomerProductDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer products (filtered by user role)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_customer_products_dto_1.QueryCustomerProductsDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('qr/:qrUrl'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer product by QR code' }),
    (0, swagger_1.ApiParam)({ name: 'qrUrl', description: 'QR URL' }),
    __param(0, (0, common_1.Param)('qrUrl')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerProductsController.prototype, "findByQR", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer product by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer Product ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CustomerProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update customer product (Customer only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer Product ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_customer_product_dto_1.UpdateCustomerProductDto, Object]),
    __metadata("design:returntype", Promise)
], CustomerProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete customer product (Customer only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Customer Product ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CustomerProductsController.prototype, "remove", null);
exports.CustomerProductsController = CustomerProductsController = __decorate([
    (0, swagger_1.ApiTags)('customer-products'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('customer-products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [customer_products_service_1.CustomerProductsService])
], CustomerProductsController);
//# sourceMappingURL=customer-products.controller.js.map