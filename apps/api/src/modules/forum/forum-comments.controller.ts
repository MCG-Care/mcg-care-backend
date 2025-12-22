import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ForumCommentsService } from './forum-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('forum')
@Controller('forum/comments')
export class ForumCommentsController {
  constructor(private readonly forumCommentsService: ForumCommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create forum comment' })
  async create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user?: any) {
    // Get userId from authenticated user
    const userId = user.id;
    // Note: Any logged-in user can comment

    // Override userId from DTO with authenticated user's ID
    createCommentDto.userId = userId;

    return this.forumCommentsService.create(createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all forum comments (Public)' })
  async findAll(@Query() query: QueryCommentsDto) {
    return this.forumCommentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forum comment by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.forumCommentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update forum comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user?: any,
  ) {
    // Get userId from authenticated user - ownership validated in service
    const userId = user.id;

    return this.forumCommentsService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete forum comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: any) {
    // Get userId and role from authenticated user
    const userId = user.id;
    const isAdmin = user.role === 'admin';
    // Service validates ownership or admin status

    return this.forumCommentsService.remove(id, userId, isAdmin);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Like/Unlike a forum comment (toggle)' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async likeComment(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: any) {
    // Get userId from authenticated user
    const userId = user.id;
    // Anyone can like/unlike any comment

    return this.forumCommentsService.likeComment(id, userId);
  }

  @Get(':id/liked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check if current user has liked a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  async hasLikedComment(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: any) {
    // Get userId from authenticated user
    const userId = user.id;

    const hasLiked = await this.forumCommentsService.hasUserLikedComment(id, userId);
    return { commentId: id, userId, hasLiked };
  }
}
