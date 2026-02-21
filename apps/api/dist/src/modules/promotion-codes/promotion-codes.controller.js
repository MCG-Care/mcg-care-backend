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
exports.PromotionCodesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const promotion_codes_service_1 = require("./promotion-codes.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PromotionCodesController = class PromotionCodesController {
    constructor(promotionCodesService) {
        this.promotionCodesService = promotionCodesService;
    }
    async findOne(id, user) {
        return this.promotionCodesService.findOne(id, user.id, user.role);
    }
};
exports.PromotionCodesController = PromotionCodesController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get promotion code by ID',
        description: 'Returns promo code details for the given ID. Accessible by the related customer, assigned technicians, and admins.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Promotion code ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PromotionCodesController.prototype, "findOne", null);
exports.PromotionCodesController = PromotionCodesController = __decorate([
    (0, swagger_1.ApiTags)('promotion-codes'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('promotion-codes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [promotion_codes_service_1.PromotionCodesService])
], PromotionCodesController);
//# sourceMappingURL=promotion-codes.controller.js.map