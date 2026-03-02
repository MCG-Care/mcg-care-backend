import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db, schema } from '../../config/database';
import { eq, and, sql, desc } from 'drizzle-orm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';

@Injectable()
export class ForumCommentsService {
  /**
   * Create a new comment on a forum post
   */
  async create(createCommentDto: CreateCommentDto) {
    // TODO: Get userId from auth token instead of DTO
    if (!createCommentDto.userId) {
      throw new ForbiddenException('User ID is required. Auth not yet implemented.');
    }

    // Check if post exists
    const post = await db.query.forumPosts.findFirst({
      where: eq(schema.forumPosts.id, createCommentDto.postId),
    });

    if (!post) {
      throw new NotFoundException(`Forum post with ID ${createCommentDto.postId} not found`);
    }

    // Insert comment
    const [newComment] = await db
      .insert(schema.forumComments)
      .values({
        postId: createCommentDto.postId,
        userId: createCommentDto.userId,
        content: createCommentDto.content,
        likeCount: 0,
      })
      .returning();

    // Fetch complete comment with user info
    return this.findOne(newComment.id);
  }

  /**
   * Find all comments with pagination and filters
   */
  async findAll(query: QueryCommentsDto) {
    const { postId, userId, page = 1, limit = 30 } = query;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (postId) {
      conditions.push(eq(schema.forumComments.postId, postId));
    }

    if (userId) {
      conditions.push(eq(schema.forumComments.userId, userId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(schema.forumComments)
      .where(whereClause);

    // Get comments with user info
    const comments = await db.query.forumComments.findMany({
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
      orderBy: [desc(schema.forumComments.createdAt)],
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

  /**
   * Find a single comment by ID
   */
  async findOne(id: number) {
    const comment = await db.query.forumComments.findFirst({
      where: eq(schema.forumComments.id, id),
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
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  /**
   * Update a comment
   */
  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    userId: number, // TODO: Will come from auth token
  ) {
    // Check if comment exists
    const existingComment = await db.query.forumComments.findFirst({
      where: eq(schema.forumComments.id, id),
    });

    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // TODO: Check if user is the owner or admin
    if (existingComment.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own comments. Admin role check not yet implemented.',
      );
    }

    // Update comment
    const [updatedComment] = await db
      .update(schema.forumComments)
      .set({
        ...updateCommentDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.forumComments.id, id))
      .returning();

    // Fetch complete comment with user info
    return this.findOne(id);
  }

  /**
   * Delete a comment
   */
  async remove(id: number, userId: number, isAdmin: boolean = false) {
    const comment = await db.query.forumComments.findFirst({
      where: eq(schema.forumComments.id, id),
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // TODO: Replace with actual admin role check from auth
    // Users can delete their own comments, admins can delete any comment
    if (!isAdmin && comment.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own comments. Admin role check not yet implemented.',
      );
    }

    // Delete comment
    await db.delete(schema.forumComments).where(eq(schema.forumComments.id, id));

    return { message: 'Comment deleted successfully' };
  }

  /**
   * Like a forum comment
   */
  async likeComment(commentId: number, userId: number) {
    // Check if comment exists
    const comment = await db.query.forumComments.findFirst({
      where: eq(schema.forumComments.id, commentId),
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    // Check if user already liked this comment
    const existingLike = await db.query.forumCommentLikes.findFirst({
      where: and(
        eq(schema.forumCommentLikes.commentId, commentId),
        eq(schema.forumCommentLikes.userId, userId),
      ),
    });

    if (existingLike) {
      // User already liked this comment, so unlike it
      await db
        .delete(schema.forumCommentLikes)
        .where(
          and(
            eq(schema.forumCommentLikes.commentId, commentId),
            eq(schema.forumCommentLikes.userId, userId),
          ),
        );

      // Decrement like count
      await db
        .update(schema.forumComments)
        .set({
          likeCount: sql`${schema.forumComments.likeCount} - 1`,
        })
        .where(eq(schema.forumComments.id, commentId));

      return {
        message: 'Comment unliked successfully',
        liked: false,
        likeCount: comment.likeCount - 1,
      };
    } else {
      // User hasn't liked this comment yet, so like it
      await db.insert(schema.forumCommentLikes).values({
        commentId,
        userId,
      });

      // Increment like count
      await db
        .update(schema.forumComments)
        .set({
          likeCount: sql`${schema.forumComments.likeCount} + 1`,
        })
        .where(eq(schema.forumComments.id, commentId));

      return {
        message: 'Comment liked successfully',
        liked: true,
        likeCount: comment.likeCount + 1,
      };
    }
  }

  /**
   * Check if a user has liked a specific comment
   */
  async hasUserLikedComment(commentId: number, userId: number): Promise<boolean> {
    const like = await db.query.forumCommentLikes.findFirst({
      where: and(
        eq(schema.forumCommentLikes.commentId, commentId),
        eq(schema.forumCommentLikes.userId, userId),
      ),
    });

    return !!like;
  }
}
