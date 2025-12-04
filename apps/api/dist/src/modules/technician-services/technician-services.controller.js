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
exports.TechnicianServicesController = void 0;
const common_1 = require("@nestjs/common");
const technician_services_service_1 = require("./technician-services.service");
const assign_service_dto_1 = require("./dto/assign-service.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let TechnicianServicesController = class TechnicianServicesController {
    constructor(technicianServicesService) {
        this.technicianServicesService = technicianServicesService;
    }
    async assignServices(assignServiceDto, user) {
        if (user.role !== 'admin' && user.role !== 'technician') {
            throw new common_1.ForbiddenException('Only admins and technicians can assign services');
        }
        if (user.role === 'technician' && assignServiceDto.technicianId !== user.id) {
            throw new common_1.ForbiddenException('Technicians can only assign services to themselves');
        }
        return this.technicianServicesService.assignServices(assignServiceDto);
    }
    async getTechnicianServices(technicianId, user) {
        if (user.role !== 'admin' && user.role !== 'technician') {
            throw new common_1.ForbiddenException('Only admins and technicians can view technician services');
        }
        if (user.role === 'technician' && user.id !== technicianId) {
            throw new common_1.ForbiddenException('You can only view your own services');
        }
        return this.technicianServicesService.getTechnicianServices(technicianId);
    }
    async getTechniciansForService(serviceId, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can view technicians for a service');
        }
        return this.technicianServicesService.getTechniciansForService(serviceId);
    }
    async getAllTechniciansWithServices(user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can view all technicians with services');
        }
        return this.technicianServicesService.getAllTechniciansWithServices();
    }
    async removeService(technicianId, serviceId, user) {
        if (user.role !== 'admin' && user.role !== 'technician') {
            throw new common_1.ForbiddenException('Only admins and technicians can remove services');
        }
        if (user.role === 'technician' && technicianId !== user.id) {
            throw new common_1.ForbiddenException('Technicians can only remove their own services');
        }
        return this.technicianServicesService.removeService(technicianId, serviceId);
    }
};
exports.TechnicianServicesController = TechnicianServicesController;
__decorate([
    (0, common_1.Post)('assign'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_service_dto_1.AssignServiceDto, Object]),
    __metadata("design:returntype", Promise)
], TechnicianServicesController.prototype, "assignServices", null);
__decorate([
    (0, common_1.Get)('technician/:technicianId'),
    __param(0, (0, common_1.Param)('technicianId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TechnicianServicesController.prototype, "getTechnicianServices", null);
__decorate([
    (0, common_1.Get)('service/:serviceId'),
    __param(0, (0, common_1.Param)('serviceId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TechnicianServicesController.prototype, "getTechniciansForService", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TechnicianServicesController.prototype, "getAllTechniciansWithServices", null);
__decorate([
    (0, common_1.Delete)('technician/:technicianId/service/:serviceId'),
    __param(0, (0, common_1.Param)('technicianId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('serviceId', common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], TechnicianServicesController.prototype, "removeService", null);
exports.TechnicianServicesController = TechnicianServicesController = __decorate([
    (0, common_1.Controller)('technician-services'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [technician_services_service_1.TechnicianServicesService])
], TechnicianServicesController);
//# sourceMappingURL=technician-services.controller.js.map