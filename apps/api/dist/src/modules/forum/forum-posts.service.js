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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumPostsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../config/database");
const drizzle_orm_1 = require("drizzle-orm");
const supabase_service_1 = require("../../config/supabase.service");
let ForumPostsService = class ForumPostsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createPostDto, imageFiles) {
        if (!createPostDto.userId) {
            throw new common_1.ForbiddenException('User ID is required. Auth not yet implemented.');
        }
        const [newPost] = await database_1.db
            .insert(database_1.schema.forumPosts)
            .values({
            userId: createPostDto.userId,
            title: createPostDto.title,
            content: createPostDto.content,
            likeCount: 0,
        })
            .returning();
        if (imageFiles && imageFiles.length > 0) {
            const imageUrls = await this.uploadPostImages(newPost.id, imageFiles);
            const imageRecords = imageUrls.map((url) => ({
                postId: newPost.id,
                url,
            }));
            await database_1.db.insert(database_1.schema.forumPostImages).values(imageRecords);
        }
        return this.findOne(newPost.id);
    }
    async findAll(query) {
        const { search, userId, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(database_1.schema.forumPosts.title, `%${search}%`), (0, drizzle_orm_1.ilike)(database_1.schema.forumPosts.content, `%${search}%`)));
        }
        if (userId) {
            conditions.push((0, drizzle_orm_1.eq)(database_1.schema.forumPosts.userId, userId));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const [{ count }] = await database_1.db
            .select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(database_1.schema.forumPosts)
            .where(whereClause);
        const posts = await database_1.db.query.forumPosts.findMany({
            where: whereClause,
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                images: true,
                comments: {
                    columns: {
                        id: true,
                    },
                },
            },
            limit,
            offset,
            orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.forumPosts.createdAt)],
        });
        const postsWithCommentCount = posts.map((post) => (Object.assign(Object.assign({}, post), { commentCount: post.comments.length, comments: undefined })));
        return {
            data: postsWithCommentCount,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
            },
        };
    }
    async findOne(id) {
        const post = await database_1.db.query.forumPosts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.forumPosts.id, id),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
                images: true,
                comments: {
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: [(0, drizzle_orm_1.desc)(database_1.schema.forumComments.createdAt)],
                },
            },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Forum post with ID ${id} not found`);
        }
        return post;
    }
    async update(id, updatePostDto, userId, imageFiles) {
        const existingPost = await database_1.db.query.forumPosts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.forumPosts.id, id),
        });
        if (!existingPost) {
            throw new common_1.NotFoundException(`Forum post with ID ${id} not found`);
        }
        if (existingPost.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own posts. Admin role check not yet implemented.');
        }
        const [updatedPost] = await database_1.db
            .update(database_1.schema.forumPosts)
            .set(Object.assign(Object.assign({}, updatePostDto), { updatedAt: new Date() }))
            .where((0, drizzle_orm_1.eq)(database_1.schema.forumPosts.id, id))
            .returning();
        if (imageFiles && imageFiles.length > 0) {
            const imageUrls = await this.uploadPostImages(id, imageFiles);
            const imageRecords = imageUrls.map((url) => ({
                postId: id,
                url,
            }));
            await database_1.db.insert(database_1.schema.forumPostImages).values(imageRecords);
        }
        return this.findOne(id);
    }
    async remove(id, userId, isAdmin = false) {
        const post = await database_1.db.query.forumPosts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.forumPosts.id, id),
            with: {
                images: true,
            },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Forum post with ID ${id} not found`);
        }
        if (!isAdmin && post.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own posts. Admin role check not yet implemented.');
        }
        if (post.images && post.images.length > 0) {
            const imagePaths = post.images.map((img) => this.supabaseService.extractPathFromUrl(img.url, 'forum-images'));
            await this.supabaseService.deleteFiles('forum-images', imagePaths);
        }
        await database_1.db.delete(database_1.schema.forumPosts).where((0, drizzle_orm_1.eq)(database_1.schema.forumPosts.id, id));
        return { message: 'Forum post deleted successfully' };
    }
    async removeImage(postId, imageId, userId, isAdmin = false) {
        const post = await database_1.db.query.forumPosts.findFirst({
            where: (0, drizzle_orm_1.eq)(database_1.schema.forumPosts.id, postId),
        });
        if (!post) {
            throw new common_1.NotFoundException(`Forum post with ID ${postId} not found`);
        }
        if (!isAdmin && post.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete images from your own posts. Admin role check not yet implemented.');
        }
        const [image] = await database_1.db
            .select()
            .from(database_1.schema.forumPostImages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(database_1.schema.forumPostImages.id, imageId), (0, drizzle_orm_1.eq)(database_1.schema.forumPostImages.postId, postId)));
        if (!image) {
            throw new common_1.NotFoundException(`Image with ID ${imageId} not found for post ${postId}`);
        }
        const imagePath = this.supabaseService.extractPathFromUrl(image.url, 'forum-images');
        await this.supabaseService.deleteFile('forum-images', imagePath);
        await database_1.db
            .delete(database_1.schema.forumPostImages)
            .where((0, drizzle_orm_1.eq)(database_1.schema.forumPostImages.id, imageId));
        return { message: 'Image deleted successfully' };
    }
    async uploadPostImages(postId, files) {
        const uploadPromises = files.map(async (file) => {
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(7);
            const extension = file.originalname.split('.').pop();
            const filename = `post-${postId}-${timestamp}-${randomString}.${extension}`;
            const path = `posts/${postId}/${filename}`;
            return this.supabaseService.uploadFile('forum-images', path, file.buffer, file.mimetype);
        });
        return Promise.all(uploadPromises);
    }
};
exports.ForumPostsService = ForumPostsService;
exports.ForumPostsService = ForumPostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ForumPostsService);
//# sourceMappingURL=forum-posts.service.js.map