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
exports.ForumCommentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const forum_comments_service_1 = require("./forum-comments.service");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const update_comment_dto_1 = require("./dto/update-comment.dto");
const query_comments_dto_1 = require("./dto/query-comments.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ForumCommentsController = class ForumCommentsController {
    constructor(forumCommentsService) {
        this.forumCommentsService = forumCommentsService;
    }
    async create(createCommentDto, user) {
        const userId = user.id;
        createCommentDto.userId = userId;
        return this.forumCommentsService.create(createCommentDto);
    }
    async findAll(query) {
        return this.forumCommentsService.findAll(query);
    }
    async findOne(id) {
        return this.forumCommentsService.findOne(id);
    }
    async update(id, updateCommentDto, user) {
        const userId = user.id;
        return this.forumCommentsService.update(id, updateCommentDto, userId);
    }
    async remove(id, user) {
        const userId = user.id;
        const isAdmin = user.role === 'admin';
        return this.forumCommentsService.remove(id, userId, isAdmin);
    }
    async likeComment(id, user) {
        const userId = user.id;
        return this.forumCommentsService.likeComment(id, userId);
    }
    async hasLikedComment(id, user) {
        const userId = user.id;
        const hasLiked = await this.forumCommentsService.hasUserLikedComment(id, userId);
        return { commentId: id, userId, hasLiked };
    }
};
exports.ForumCommentsController = ForumCommentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create forum comment' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_comment_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], ForumCommentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all forum comments (Public)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_comments_dto_1.QueryCommentsDto]),
    __metadata("design:returntype", Promise)
], ForumCommentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get forum comment by ID (Public)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Comment ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ForumCommentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update forum comment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Comment ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_comment_dto_1.UpdateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], ForumCommentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete forum comment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Comment ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ForumCommentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Like/Unlike a forum comment (toggle)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Comment ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ForumCommentsController.prototype, "likeComment", null);
__decorate([
    (0, common_1.Get)(':id/liked'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if current user has liked a comment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Comment ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ForumCommentsController.prototype, "hasLikedComment", null);
exports.ForumCommentsController = ForumCommentsController = __decorate([
    (0, swagger_1.ApiTags)('forum'),
    (0, common_1.Controller)('forum/comments'),
    __metadata("design:paramtypes", [forum_comments_service_1.ForumCommentsService])
], ForumCommentsController);
//# sourceMappingURL=forum-comments.controller.js.map