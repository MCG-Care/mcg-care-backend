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
exports.MaintenanceRemindersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const maintenance_reminders_service_1 = require("./maintenance-reminders.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let MaintenanceRemindersController = class MaintenanceRemindersController {
    constructor(maintenanceRemindersService) {
        this.maintenanceRemindersService = maintenanceRemindersService;
    }
    async getActiveReminders(user) {
        if (user.role !== 'customer') {
            throw new common_1.BadRequestException('Only customers can view reminders');
        }
        return this.maintenanceRemindersService.getActiveReminders(user.id);
    }
};
exports.MaintenanceRemindersController = MaintenanceRemindersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get active maintenance reminders (Customer only)',
        description: 'Returns all active reminders for the logged-in customer within the next month from today. ' +
            'Each reminder includes the aircon details, service type, and associated promotion code.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaintenanceRemindersController.prototype, "getActiveReminders", null);
exports.MaintenanceRemindersController = MaintenanceRemindersController = __decorate([
    (0, swagger_1.ApiTags)('maintenance-reminders'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('maintenance-reminders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [maintenance_reminders_service_1.MaintenanceRemindersService])
], MaintenanceRemindersController);
//# sourceMappingURL=maintenance-reminders.controller.js.map