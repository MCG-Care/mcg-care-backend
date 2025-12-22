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
exports.TimeslotsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const timeslots_service_1 = require("./timeslots.service");
const create_timeslot_dto_1 = require("./dto/create-timeslot.dto");
const update_timeslot_dto_1 = require("./dto/update-timeslot.dto");
const query_timeslots_dto_1 = require("./dto/query-timeslots.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const config_1 = require("@nestjs/config");
let TimeslotsController = class TimeslotsController {
    constructor(timeslotsService, configService) {
        this.timeslotsService = timeslotsService;
        this.configService = configService;
    }
    async create(createTimeslotDto, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can create timeslots');
        }
        return this.timeslotsService.create(createTimeslotDto);
    }
    async findAll(query, user) {
        if (user.role === 'technician' && !query.technicianId) {
            query.technicianId = user.id;
        }
        else if (user.role === 'technician' && query.technicianId !== user.id) {
            throw new common_1.ForbiddenException('Technicians can only view their own timeslots');
        }
        return this.timeslotsService.findAll(query);
    }
    async getTechnicianAvailability(technicianId, startDate, endDate, user) {
        if (!startDate || !endDate) {
            throw new common_1.ForbiddenException('startDate and endDate are required');
        }
        return this.timeslotsService.getTechnicianAvailability(technicianId, startDate, endDate);
    }
    async findOne(id, user) {
        const timeslot = await this.timeslotsService.findOne(id);
        if (user.role === 'technician' && timeslot.technicianId !== user.id) {
            throw new common_1.ForbiddenException('You can only view your own timeslots');
        }
        return timeslot;
    }
    async update(id, updateTimeslotDto, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can update timeslots');
        }
        return this.timeslotsService.update(id, updateTimeslotDto);
    }
    async remove(id, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can delete timeslots');
        }
        return this.timeslotsService.remove(id);
    }
    async initializeTechnician(technicianId, user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can initialize technician timeslots');
        }
        return this.timeslotsService.initializeTechnicianTimeslots(technicianId);
    }
    async dailyMaintenance(user) {
        if (user.role !== 'admin') {
            throw new common_1.ForbiddenException('Only admins can trigger maintenance');
        }
        return this.timeslotsService.dailyTimeslotMaintenance();
    }
    async dailyMaintenanceCron(cronSecret) {
        const expectedSecret = this.configService.get('CRON_SECRET');
        if (!expectedSecret) {
            throw new common_1.UnauthorizedException('CRON_SECRET not configured');
        }
        if (!cronSecret || cronSecret !== expectedSecret) {
            throw new common_1.UnauthorizedException('Invalid cron secret token');
        }
        return this.timeslotsService.dailyTimeslotMaintenance();
    }
};
exports.TimeslotsController = TimeslotsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create timeslot (Admin only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_timeslot_dto_1.CreateTimeslotDto, Object]),
    __metadata("design:returntype", Promise)
], TimeslotsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all timeslots (filtered by user role)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_timeslots_dto_1.QueryTimeslotsDto, Object]),
    __metadata("design:returntype", Promise)
], TimeslotsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('technician/:technicianId/availability'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get technician availability' }),
    (0, swagger_1.ApiParam)({ name: 'technicianId', description: 'Technician ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', description: 'End date (YYYY-MM-DD)', required: true }),
    __param(0, (0, common_1.Param)('technicianId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], TimeslotsController.prototype, "getTechnicianAvailability", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get timeslot by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Timeslot ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TimeslotsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update timeslot (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Timeslot ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_timeslot_dto_1.UpdateTimeslotDto, Object]),
    __metadata("design:returntype", Promise)
], TimeslotsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete timeslot (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Timeslot ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TimeslotsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('technician/:technicianId/initialize'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize technician timeslots (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'technicianId', description: 'Technician ID' }),
    __param(0, (0, common_1.Param)('technicianId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TimeslotsController.prototype, "initializeTechnician", null);
__decorate([
    (0, common_1.Post)('maintenance/daily'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Run daily timeslot maintenance (Admin only)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeslotsController.prototype, "dailyMaintenance", null);
__decorate([
    (0, common_1.Post)('maintenance/daily-cron'),
    (0, swagger_1.ApiOperation)({
        summary: 'Run daily timeslot maintenance (Cron job endpoint - uses secret token)',
    }),
    (0, swagger_1.ApiHeader)({ name: 'X-Cron-Secret', description: 'Secret token for cron authentication' }),
    __param(0, (0, common_1.Headers)('x-cron-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimeslotsController.prototype, "dailyMaintenanceCron", null);
exports.TimeslotsController = TimeslotsController = __decorate([
    (0, swagger_1.ApiTags)('timeslots'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('timeslots'),
    __metadata("design:paramtypes", [timeslots_service_1.TimeslotsService,
        config_1.ConfigService])
], TimeslotsController);
//# sourceMappingURL=timeslots.controller.js.map