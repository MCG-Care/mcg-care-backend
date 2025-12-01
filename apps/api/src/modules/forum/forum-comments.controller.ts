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
import { ForumCommentsService } from './forum-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('forum/comments')
export class ForumCommentsController {
  constructor(private readonly forumCommentsService: ForumCommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user?: any) {
    // Get userId from authenticated user
    const userId = user.id;
    // Note: Any logged-in user can comment

    // Override userId from DTO with authenticated user's ID
    createCommentDto.userId = userId;

    return this.forumCommentsService.create(createCommentDto);
  }

  @Get()
  async findAll(@Query() query: QueryCommentsDto) {
    return this.forumCommentsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.forumCommentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: any) {
    // Get userId and role from authenticated user
    const userId = user.id;
    const isAdmin = user.role === 'admin';
    // Service validates ownership or admin status

    return this.forumCommentsService.remove(id, userId, isAdmin);
  }
}

