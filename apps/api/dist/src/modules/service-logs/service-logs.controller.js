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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceLogsController = void 0;
const common_1 = require("@nestjs/common");
const service_logs_service_1 = require("./service-logs.service");
const create_service_log_dto_1 = require("./dto/create-service-log.dto");
const update_service_log_dto_1 = require("./dto/update-service-log.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ServiceLogsController = class ServiceLogsController {
    constructor(serviceLogsService) {
        this.serviceLogsService = serviceLogsService;
    }
    async create(createServiceLogDto, user) {
        return this.serviceLogsService.create(user.id, user.role, createServiceLogDto);
    }
    async findByBookingId(bookingId, user) {
        return this.serviceLogsService.findByBookingId(bookingId, user.id, user.role);
    }
    async findOne(id, user) {
        return this.serviceLogsService.findOne(id, user.id, user.role);
    }
    async update(id, updateServiceLogDto, user) {
        return this.serviceLogsService.update(id, user.id, user.role, updateServiceLogDto);
    }
    async remove(id, user) {
        return this.serviceLogsService.remove(id, user.id, user.role);
    }
};
exports.ServiceLogsController = ServiceLogsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_service_log_dto_1.CreateServiceLogDto, Object]),
    __metadata("design:returntype", Promise)
], ServiceLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ServiceLogsController.prototype, "findByBookingId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ServiceLogsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_service_log_dto_1.UpdateServiceLogDto, Object]),
    __metadata("design:returntype", Promise)
], ServiceLogsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ServiceLogsController.prototype, "remove", null);
exports.ServiceLogsController = ServiceLogsController = __decorate([
    (0, common_1.Controller)('service-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [typeof (_a = typeof service_logs_service_1.ServiceLogsService !== "undefined" && service_logs_service_1.ServiceLogsService) === "function" ? _a : Object])
], ServiceLogsController);
//# sourceMappingURL=service-logs.controller.js.map