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
exports.ForumPostsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const forum_posts_service_1 = require("./forum-posts.service");
const create_post_dto_1 = require("./dto/create-post.dto");
const update_post_dto_1 = require("./dto/update-post.dto");
const query_posts_dto_1 = require("./dto/query-posts.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ForumPostsController = class ForumPostsController {
    constructor(forumPostsService) {
        this.forumPostsService = forumPostsService;
    }
    async create(createPostDto, files, user) {
        const userId = user.id;
        if (files && files.length > 0) {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            for (const file of files) {
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    throw new common_1.BadRequestException(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`);
                }
            }
        }
        createPostDto.userId = userId;
        return this.forumPostsService.create(createPostDto, files);
    }
    async findAll(query) {
        return this.forumPostsService.findAll(query);
    }
    async findOne(id) {
        return this.forumPostsService.findOne(id);
    }
    async update(id, updatePostDto, files, user) {
        const userId = user.id;
        const isAdmin = user.role === 'admin';
        if (files && files.length > 0) {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            for (const file of files) {
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    throw new common_1.BadRequestException(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`);
                }
            }
        }
        return this.forumPostsService.update(id, updatePostDto, userId, isAdmin, files);
    }
    async remove(id, user) {
        const userId = user.id;
        const isAdmin = user.role === 'admin';
        return this.forumPostsService.remove(id, userId, isAdmin);
    }
    async removeImage(postId, imageId, user) {
        const userId = user.id;
        const isAdmin = user.role === 'admin';
        return this.forumPostsService.removeImage(postId, imageId, userId, isAdmin);
    }
    async likePost(id, user) {
        const userId = user.id;
        return this.forumPostsService.likePost(id, userId);
    }
    async hasLikedPost(id, user) {
        const userId = user.id;
        const hasLiked = await this.forumPostsService.hasUserLikedPost(id, userId);
        return { postId: id, userId, hasLiked };
    }
};
exports.ForumPostsController = ForumPostsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create forum post' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto, Array, Object]),
    __metadata("design:returntype", Promise)
], ForumPostsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all forum posts (Public)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_posts_dto_1.QueryPostsDto]),
    __metadata("design:returntype", Promise)
], ForumPostsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get forum post by ID (Public)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Post ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ForumPostsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update forum post' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Post ID' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_post_dto_1.UpdatePostDto, Array, Object]),
    __metadata("design:returntype", Promise)
], ForumPostsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete forum post' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Post ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ForumPostsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)(':postId/images/:imageId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete image from forum post' }),
    (0, swagger_1.ApiParam)({ name: 'postId', description: 'Post ID' }),
    (0, swagger_1.ApiParam)({ name: 'imageId', description: 'Image ID' }),
    __param(0, (0, common_1.Param)('postId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('imageId', common_1.ParseIntPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ForumPostsController.prototype, "removeImage", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Like/Unlike a forum post (toggle)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Post ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ForumPostsController.prototype, "likePost", null);
__decorate([
    (0, common_1.Get)(':id/liked'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if current user has liked a post' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Post ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ForumPostsController.prototype, "hasLikedPost", null);
exports.ForumPostsController = ForumPostsController = __decorate([
    (0, swagger_1.ApiTags)('forum'),
    (0, common_1.Controller)('forum/posts'),
    __metadata("design:paramtypes", [forum_posts_service_1.ForumPostsService])
], ForumPostsController);
//# sourceMappingURL=forum-posts.controller.js.map