import { Module } from '@nestjs/common';
import { ForumPostsService } from './forum-posts.service';
import { ForumCommentsService } from './forum-comments.service';
import { ForumPostsController } from './forum-posts.controller';
import { ForumCommentsController } from './forum-comments.controller';
import { DatabaseModule } from '../../config/database.module';
import { SupabaseService } from '../../config/supabase.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ForumPostsController, ForumCommentsController],
  providers: [ForumPostsService, ForumCommentsService, SupabaseService],
  exports: [ForumPostsService, ForumCommentsService],
})
export class ForumModule {}

