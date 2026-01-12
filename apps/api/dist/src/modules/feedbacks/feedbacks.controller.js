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
exports.FeedbacksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const feedbacks_service_1 = require("./feedbacks.service");
const create_feedback_dto_1 = require("./dto/create-feedback.dto");
const update_feedback_dto_1 = require("./dto/update-feedback.dto");
const query_feedbacks_dto_1 = require("./dto/query-feedbacks.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let FeedbacksController = class FeedbacksController {
    constructor(feedbacksService) {
        this.feedbacksService = feedbacksService;
    }
    async create(createFeedbackDto, user) {
        return this.feedbacksService.create(user.id, user.role, createFeedbackDto);
    }
    async findAll(query, user) {
        return this.feedbacksService.findAll(user.id, user.role, query);
    }
    async findByBookingId(bookingId, user) {
        return this.feedbacksService.findByBookingId(bookingId, user.id, user.role);
    }
    async findOne(id, user) {
        return this.feedbacksService.findOne(id, user.id, user.role);
    }
    async update(id, updateFeedbackDto, user) {
        return this.feedbacksService.update(id, user.id, user.role, updateFeedbackDto);
    }
    async remove(id, user) {
        return this.feedbacksService.remove(id, user.id, user.role);
    }
};
exports.FeedbacksController = FeedbacksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create feedback' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_feedback_dto_1.CreateFeedbackDto, Object]),
    __metadata("design:returntype", Promise)
], FeedbacksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all feedbacks (filtered by user role)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_feedbacks_dto_1.QueryFeedbacksDto, Object]),
    __metadata("design:returntype", Promise)
], FeedbacksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('booking/:bookingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get feedback for a specific booking' }),
    (0, swagger_1.ApiParam)({ name: 'bookingId', description: 'Booking ID' }),
    __param(0, (0, common_1.Param)('bookingId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FeedbacksController.prototype, "findByBookingId", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get feedback by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Feedback ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FeedbacksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update feedback' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Feedback ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_feedback_dto_1.UpdateFeedbackDto, Object]),
    __metadata("design:returntype", Promise)
], FeedbacksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete feedback' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Feedback ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FeedbacksController.prototype, "remove", null);
exports.FeedbacksController = FeedbacksController = __decorate([
    (0, swagger_1.ApiTags)('feedbacks'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('feedbacks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [feedbacks_service_1.FeedbacksService])
], FeedbacksController);
//# sourceMappingURL=feedbacks.controller.js.map