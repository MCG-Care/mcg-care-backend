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
exports.ServiceTypesController = void 0;
const common_1 = require("@nestjs/common");
const service_types_service_1 = require("./service-types.service");
const create_service_type_dto_1 = require("./dto/create-service-type.dto");
const update_service_type_dto_1 = require("./dto/update-service-type.dto");
const query_service_types_dto_1 = require("./dto/query-service-types.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ServiceTypesController = class ServiceTypesController {
    constructor(serviceTypesService) {
        this.serviceTypesService = serviceTypesService;
    }
    async create(createServiceTypeDto, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can create service types');
        }
        return this.serviceTypesService.create(createServiceTypeDto);
    }
    async findAll(query) {
        return this.serviceTypesService.findAll(query);
    }
    async findOne(id) {
        return this.serviceTypesService.findOne(id);
    }
    async update(id, updateServiceTypeDto, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can update service types');
        }
        return this.serviceTypesService.update(id, updateServiceTypeDto);
    }
    async remove(id, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can delete service types');
        }
        return this.serviceTypesService.remove(id);
    }
};
exports.ServiceTypesController = ServiceTypesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_type_dto_1.CreateServiceTypeDto, Object]),
    __metadata("design:returntype", Promise)
], ServiceTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_service_types_dto_1.QueryServiceTypesDto]),
    __metadata("design:returntype", Promise)
], ServiceTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServiceTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_service_type_dto_1.UpdateServiceTypeDto, Object]),
    __metadata("design:returntype", Promise)
], ServiceTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ServiceTypesController.prototype, "remove", null);
exports.ServiceTypesController = ServiceTypesController = __decorate([
    (0, common_1.Controller)('service-types'),
    __metadata("design:paramtypes", [service_types_service_1.ServiceTypesService])
], ServiceTypesController);
//# sourceMappingURL=service-types.controller.js.map