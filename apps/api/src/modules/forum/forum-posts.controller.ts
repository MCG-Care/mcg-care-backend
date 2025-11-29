import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ForumPostsService } from './forum-posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Controller('forum/posts')
export class ForumPostsController {
  constructor(private readonly forumPostsService: ForumPostsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images per post
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // TODO: Get userId from auth token instead of body
    // For now, accepting it in the body for testing

    // Validate file types
    if (files && files.length > 0) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
      ];
      for (const file of files) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`,
          );
        }
      }
    }

    return this.forumPostsService.create(createPostDto, files);
  }

  @Get()
  async findAll(@Query() query: QueryPostsDto) {
    return this.forumPostsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.forumPostsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    // TODO: Get userId from auth token
    // For now, accepting it in the body for testing
    const userIdRaw = (updatePostDto as any).userId;
    if (!userIdRaw) {
      throw new BadRequestException(
        'userId is required in body (temporary until auth is implemented)',
      );
    }

    // Convert to number (form-data sends as string)
    const userId = parseInt(userIdRaw, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('userId must be a valid number');
    }

    // Validate file types
    if (files && files.length > 0) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
      ];
      for (const file of files) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`,
          );
        }
      }
    }

    return this.forumPostsService.update(id, updatePostDto, userId, files);
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

    // Convert to number
    const userId = parseInt(userIdRaw, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('userId must be a valid number');
    }

    return this.forumPostsService.remove(id, userId, isAdmin);
  }

  @Delete(':postId/images/:imageId')
  async removeImage(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() body: any,
  ) {
    // TODO: Get userId and role from auth token
    const userIdRaw = body.userId;
    const isAdmin = body.isAdmin === true || body.isAdmin === 'true';

    if (!userIdRaw) {
      throw new BadRequestException(
        'userId is required in body (temporary until auth is implemented)',
      );
    }

    // Convert to number
    const userId = parseInt(userIdRaw, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('userId must be a valid number');
    }

    return this.forumPostsService.removeImage(postId, imageId, userId, isAdmin);
  }
}

