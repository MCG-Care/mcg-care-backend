import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, ilike, or, and, sql, desc, inArray } from 'drizzle-orm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class ForumPostsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new forum post with optional images
   */
  async create(createPostDto: CreatePostDto, imageFiles?: Express.Multer.File[]) {
    // TODO: Get userId from auth token instead of DTO
    // For now, we'll require it in the DTO or use a default
    if (!createPostDto.userId) {
      throw new ForbiddenException('User ID is required. Auth not yet implemented.');
    }

    // Insert forum post
    const [newPost] = await db
      .insert(schema.forumPosts)
      .values({
        userId: createPostDto.userId,
        title: createPostDto.title,
        content: createPostDto.content,
        likeCount: 0,
      })
      .returning();

    // Upload images if provided
    if (imageFiles && imageFiles.length > 0) {
      const imageUrls = await this.uploadPostImages(newPost.id, imageFiles);

      // Insert image records
      const imageRecords = imageUrls.map((url) => ({
        postId: newPost.id,
        url,
      }));

      await db.insert(schema.forumPostImages).values(imageRecords);
    }

    // Fetch complete post with user info and images
    return this.findOne(newPost.id);
  }

  /**
   * Find all posts with pagination and filters
   */
  async findAll(query: QueryPostsDto) {
    const { search, userId, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereClause;

    if (search && search.trim()) {
      // Search in title, content, and poster's username (user.name)
      const searchTerm = `%${search.trim()}%`;
      const matchingRows = await db
        .select({ id: schema.forumPosts.id })
        .from(schema.forumPosts)
        .leftJoin(schema.users, eq(schema.forumPosts.userId, schema.users.id))
        .where(
          or(
            ilike(schema.forumPosts.title, searchTerm),
            ilike(schema.forumPosts.content, searchTerm),
            ilike(schema.users.name, searchTerm),
          ),
        );
      const matchingIds = matchingRows.map((r) => r.id);
      if (matchingIds.length === 0) {
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
      whereClause = inArray(schema.forumPosts.id, matchingIds);
    }

    if (userId) {
      whereClause = whereClause
        ? and(whereClause, eq(schema.forumPosts.userId, userId))
        : eq(schema.forumPosts.userId, userId);
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.forumPosts)
      .where(whereClause);

    // Get posts with user info, images, and comment count
    const posts = await db.query.forumPosts.findMany({
      where: whereClause,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            role: true,
            // Exclude sensitive fields like password
          },
        },
        images: true,
        comments: {
          columns: {
            id: true, // Just to count comments
          },
        },
      },
      limit,
      offset,
      orderBy: [desc(schema.forumPosts.createdAt)],
    });

    // Transform data to include comment count
    const postsWithCommentCount = posts.map((post) => ({
      ...post,
      commentCount: post.comments.length,
      comments: undefined, // Remove the comments array, keep only the count
    }));

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

  /**
   * Find a single post by ID
   */
  async findOne(id: number) {
    const post = await db.query.forumPosts.findFirst({
      where: eq(schema.forumPosts.id, id),
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
          orderBy: [desc(schema.forumComments.createdAt)],
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Forum post with ID ${id} not found`);
    }

    return post;
  }

  /**
   * Update a forum post
   */
  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
    isAdmin: boolean = false,
    imageFiles?: Express.Multer.File[],
  ) {
    // Check if post exists
    const existingPost = await db.query.forumPosts.findFirst({
      where: eq(schema.forumPosts.id, id),
    });

    if (!existingPost) {
      throw new NotFoundException(`Forum post with ID ${id} not found`);
    }

    // Users can update their own posts, admins can update any post
    if (!isAdmin && existingPost.userId !== userId) {
      throw new ForbiddenException('You can only update your own posts.');
    }

    // Update post
    const [updatedPost] = await db
      .update(schema.forumPosts)
      .set({
        ...updatePostDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.forumPosts.id, id))
      .returning();

    // Upload new images if provided
    if (imageFiles && imageFiles.length > 0) {
      const imageUrls = await this.uploadPostImages(id, imageFiles);

      // Insert new image records
      const imageRecords = imageUrls.map((url) => ({
        postId: id,
        url,
      }));

      await db.insert(schema.forumPostImages).values(imageRecords);
    }

    // Fetch complete post with images
    return this.findOne(id);
  }

  /**
   * Delete a forum post
   */
  async remove(id: number, userId: number, isAdmin: boolean = false) {
    const post = await db.query.forumPosts.findFirst({
      where: eq(schema.forumPosts.id, id),
      with: {
        images: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Forum post with ID ${id} not found`);
    }

    // TODO: Replace with actual admin role check from auth
    // Users can delete their own posts, admins can delete any post
    if (!isAdmin && post.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own posts. Admin role check not yet implemented.',
      );
    }

    // Delete all post images from storage
    if (post.images && post.images.length > 0) {
      const imagePaths = post.images.map((img) =>
        this.supabaseService.extractPathFromUrl(img.url, 'forum-images'),
      );
      await this.supabaseService.deleteFiles('forum-images', imagePaths);
    }

    // Delete post (cascade will delete images and comments)
    await db.delete(schema.forumPosts).where(eq(schema.forumPosts.id, id));

    return { message: 'Forum post deleted successfully' };
  }

  /**
   * Delete a specific post image
   */
  async removeImage(postId: number, imageId: number, userId: number, isAdmin: boolean = false) {
    // Check if post exists and user owns it
    const post = await db.query.forumPosts.findFirst({
      where: eq(schema.forumPosts.id, postId),
    });

    if (!post) {
      throw new NotFoundException(`Forum post with ID ${postId} not found`);
    }

    // TODO: Replace with actual admin role check
    if (!isAdmin && post.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete images from your own posts. Admin role check not yet implemented.',
      );
    }

    // Find the image
    const [image] = await db
      .select()
      .from(schema.forumPostImages)
      .where(
        and(eq(schema.forumPostImages.id, imageId), eq(schema.forumPostImages.postId, postId)),
      );

    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found for post ${postId}`);
    }

    // Delete from storage
    const imagePath = this.supabaseService.extractPathFromUrl(image.url, 'forum-images');
    await this.supabaseService.deleteFile('forum-images', imagePath);

    // Delete from database
    await db.delete(schema.forumPostImages).where(eq(schema.forumPostImages.id, imageId));

    return { message: 'Image deleted successfully' };
  }

  /**
   * Like a forum post
   */
  async likePost(postId: number, userId: number) {
    // Check if post exists
    const post = await db.query.forumPosts.findFirst({
      where: eq(schema.forumPosts.id, postId),
    });

    if (!post) {
      throw new NotFoundException(`Forum post with ID ${postId} not found`);
    }

    // Check if user already liked this post
    const existingLike = await db.query.forumPostLikes.findFirst({
      where: and(
        eq(schema.forumPostLikes.postId, postId),
        eq(schema.forumPostLikes.userId, userId),
      ),
    });

    if (existingLike) {
      // User already liked this post, so unlike it
      await db
        .delete(schema.forumPostLikes)
        .where(
          and(eq(schema.forumPostLikes.postId, postId), eq(schema.forumPostLikes.userId, userId)),
        );

      // Decrement like count
      await db
        .update(schema.forumPosts)
        .set({
          likeCount: sql`${schema.forumPosts.likeCount} - 1`,
        })
        .where(eq(schema.forumPosts.id, postId));

      return {
        message: 'Post unliked successfully',
        liked: false,
        likeCount: post.likeCount - 1,
      };
    } else {
      // User hasn't liked this post yet, so like it
      await db.insert(schema.forumPostLikes).values({
        postId,
        userId,
      });

      // Increment like count
      await db
        .update(schema.forumPosts)
        .set({
          likeCount: sql`${schema.forumPosts.likeCount} + 1`,
        })
        .where(eq(schema.forumPosts.id, postId));

      return {
        message: 'Post liked successfully',
        liked: true,
        likeCount: post.likeCount + 1,
      };
    }
  }

  /**
   * Check if a user has liked a specific post
   */
  async hasUserLikedPost(postId: number, userId: number): Promise<boolean> {
    const like = await db.query.forumPostLikes.findFirst({
      where: and(
        eq(schema.forumPostLikes.postId, postId),
        eq(schema.forumPostLikes.userId, userId),
      ),
    });

    return !!like;
  }

  /**
   * Upload post images to Supabase Storage
   */
  private async uploadPostImages(postId: number, files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(async (file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = file.originalname.split('.').pop();
      const filename = `post-${postId}-${timestamp}-${randomString}.${extension}`;
      const path = `posts/${postId}/${filename}`;

      // Upload to Supabase
      return this.supabaseService.uploadFile('forum-images', path, file.buffer, file.mimetype);
    });

    return Promise.all(uploadPromises);
  }
}
