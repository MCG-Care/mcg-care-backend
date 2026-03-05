"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumCommentsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
let ForumCommentsService = class ForumCommentsService {
    async create(createCommentDto) {
        if (!createCommentDto.userId) {
            throw new common_1.ForbiddenException('User ID is required. Auth not yet implemented.');
        }
        const post = await database_1.db.query.forumPosts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.forumPosts.id, createCommentDto.postId),
        });
        if (!post) {
            throw new common_1.NotFoundException(`Forum post with ID ${createCommentDto.postId} not found`);
        }
        const [newComment] = await database_1.db
            .insert(database_1.schema.forumComments)
            .values({
            postId: createCommentDto.postId,
            userId: createCommentDto.userId,
            content: createCommentDto.content,
            likeCount: 0,
        })
            .returning();
        return this.findOne(newComment.id);
    }
    async findAll(query) {
        const { postId, userId, page = 1, limit = 30 } = query;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (postId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.forumComments.postId, postId));
        }
        if (userId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.forumComments.userId, userId));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const [{ count }] = await database_1.db
            .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(database_1.schema.forumComments)
            .where(whereClause);
        const comments = await database_1.db.query.forumComments.findMany({
            where: whereClause,
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                post: {
                    columns: {
                        id: true,
                        title: true,
                    },
                },
            },
            limit,
            offset,
            orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.forumComments.createdAt)],
        });
        return {
            data: comments,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        };
    }
    async findOne(id) {
        const comment = await database_1.db.query.forumComments.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.forumComments.id, id),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                post: {
                    columns: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        return comment;
    }
    async update(id, updateCommentDto, userId) {
        const existingComment = await database_1.db.query.forumComments.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.forumComments.id, id),
        });
        if (!existingComment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        if (existingComment.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own comments. Admin role check not yet implemented.');
        }
        const [updatedComment] = await database_1.db
            .update(database_1.schema.forumComments)
            .set(Object.assign(Object.assign({}, updateCommentDto), { updatedAt: new Date() }))
            .where((0, drizzle_orm_1.eq)(database_1.schema.forumComments.id, id))
            .returning();
        return this.findOne(id);
    }
    async remove(id, userId, isAdmin = false) {
        const comment = await database_1.db.query.forumComments.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.forumComments.id, id),
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        if (!isAdmin && comment.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own comments. Admin role check not yet implemented.');
        }
        await database_1.db.delete(database_1.schema.forumComments).where((0, drizzle_orm_1.eq)(database_1.schema.forumComments.id, id));
        return { message: 'Comment deleted successfully' };
    }
    async likeComment(commentId, userId) {
        const comment = await database_1.db.query.forumComments.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.forumComments.id, commentId),
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${commentId} not found`);
        }
        const existingLike = await database_1.db.query.forumCommentLikes.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.forumCommentLikes.commentId, commentId), (0, drizzle_orm_1.eq)(database_1.schema.forumCommentLikes.userId, userId)),
        });
        if (existingLike) {
            await database_1.db
                .delete(database_1.schema.forumCommentLikes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.forumCommentLikes.commentId, commentId), (0, drizzle_orm_1.eq)(database_1.schema.forumCommentLikes.userId, userId)));
            await database_1.db
                .update(database_1.schema.forumComments)
                .set({
                likeCount: (0, drizzle_orm_1.sql) `${database_1.schema.forumComments.likeCount} - 1`,
            })
                .where((0, drizzle_orm_1.eq)(database_1.schema.forumComments.id, commentId));
            return {
                message: 'Comment unliked successfully',
                liked: false,
                likeCount: comment.likeCount - 1,
            };
        }
        else {
            await database_1.db.insert(database_1.schema.forumCommentLikes).values({
                commentId,
                userId,
            });
            await database_1.db
                .update(database_1.schema.forumComments)
                .set({
                likeCount: (0, drizzle_orm_1.sql) `${database_1.schema.forumComments.likeCount} + 1`,
            })
                .where((0, drizzle_orm_1.eq)(database_1.schema.forumComments.id, commentId));
            return {
                message: 'Comment liked successfully',
                liked: true,
                likeCount: comment.likeCount + 1,
            };
        }
    }
    async hasUserLikedComment(commentId, userId) {
        const like = await database_1.db.query.forumCommentLikes.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.forumCommentLikes.commentId, commentId), (0, drizzle_orm_1.eq)(database_1.schema.forumCommentLikes.userId, userId)),
        });
        return !!like;
    }
};
exports.ForumCommentsService = ForumCommentsService;
exports.ForumCommentsService = ForumCommentsService = __decorate([
    (0, common_1.Injectable)()
], ForumCommentsService);
//# sourceMappingURL=forum-comments.service.js.map