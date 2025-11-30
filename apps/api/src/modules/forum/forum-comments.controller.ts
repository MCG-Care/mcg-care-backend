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
} from '@nestjs/common';
import { ForumCommentsService } from './forum-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';

@Controller('forum/comments')
export class ForumCommentsController {
  constructor(private readonly forumCommentsService: ForumCommentsService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    // TODO: Get userId from auth token instead of body
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    // TODO: Get userId from auth token
    const userIdRaw = (updateCommentDto as any).userId;
    if (!userIdRaw) {
      throw new BadRequestException(
        'userId is required in body (temporary until auth is implemented)',
      );
    }

    // Convert to number (JSON sends as number, but just in case)
    const userId = typeof userIdRaw === 'number' ? userIdRaw : parseInt(userIdRaw, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('userId must be a valid number');
    }

    return this.forumCommentsService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    // TODO: Get userId and role from auth token
    const userIdRaw = body.userId;
    const isAdmin = body.isAdmin === true || body.isAdmin === 'true';

    if (!userIdRaw) {
      throw new BadRequestException(
        'userId is required in body (temporary until auth is implemented)',
      );
    }

    // Convert to number (JSON sends as number, but just in case)
    const userId = typeof userIdRaw === 'number' ? userIdRaw : parseInt(userIdRaw, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('userId must be a valid number');
    }

    return this.forumCommentsService.remove(id, userId, isAdmin);
  }
}

