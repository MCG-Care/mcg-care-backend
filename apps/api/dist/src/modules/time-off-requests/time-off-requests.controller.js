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
exports.TimeOffRequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const time_off_requests_service_1 = require("./time-off-requests.service");
const create_time_off_request_dto_1 = require("./dto/create-time-off-request.dto");
const query_time_off_requests_dto_1 = require("./dto/query-time-off-requests.dto");
const review_time_off_request_dto_1 = require("./dto/review-time-off-request.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let TimeOffRequestsController = class TimeOffRequestsController {
    constructor(timeOffRequestsService) {
        this.timeOffRequestsService = timeOffRequestsService;
    }
    async create(createDto, user) {
        if (user.role !== 'technician') {
            throw new common_1.ForbiddenException('Only technicians can create time-off requests');
        }
        return this.timeOffRequestsService.create(user.id, createDto);
    }
    async findAll(query, user) {
        if (user.role === 'technician') {
            query.technicianId = user.id;
        }
        return this.timeOffRequestsService.findAll(query);
    }
    async findOne(id, user) {
        const request = await this.timeOffRequestsService.findOne(id);
        if (user.role === 'technician' && request.technicianId !== user.id) {
            throw new common_1.ForbiddenException('You can only view your own time-off requests');
        }
        return request;
    }
    async review(id, reviewDto, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can review time-off requests');
        }
        return this.timeOffRequestsService.review(id, user.id, reviewDto);
    }
    async remove(id, user) {
        return this.timeOffRequestsService.remove(id, user.id, user.role);
    }
};
exports.TimeOffRequestsController = TimeOffRequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create time-off request (Technician only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_time_off_request_dto_1.CreateTimeOffRequestDto, Object]),
    __metadata("design:returntype", Promise)
], TimeOffRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all time-off requests (filtered by user role)',
        description: 'Admins can view all requests. Technicians can only view their own requests.',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_time_off_requests_dto_1.QueryTimeOffRequestsDto, Object]),
    __metadata("design:returntype", Promise)
], TimeOffRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get time-off request by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Time-off request ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TimeOffRequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Review time-off request (Admin only)',
        description: 'Approve or reject a time-off request. If approved, timeslots are automatically blocked.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Time-off request ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, review_time_off_request_dto_1.ReviewTimeOffRequestDto, Object]),
    __metadata("design:returntype", Promise)
], TimeOffRequestsController.prototype, "review", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete time-off request',
        description: 'Technicians can delete their own pending requests. Admins can delete any pending request.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Time-off request ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TimeOffRequestsController.prototype, "remove", null);
exports.TimeOffRequestsController = TimeOffRequestsController = __decorate([
    (0, swagger_1.ApiTags)('time-off-requests'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('time-off-requests'),
    __metadata("design:paramtypes", [time_off_requests_service_1.TimeOffRequestsService])
], TimeOffRequestsController);
//# sourceMappingURL=time-off-requests.controller.js.map