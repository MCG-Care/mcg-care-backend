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
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { ForumPostsService } from './forum-posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('forum')
@Controller('forum/posts')
export class ForumPostsController {
  constructor(private readonly forumPostsService: ForumPostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create forum post' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images per post
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @CurrentUser() user?: any,
  ) {
    // Get userId from authenticated user
    const userId = user.id;
    // Note: Any logged-in user can post (frontend handles role-based UI)

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

    // Override userId from DTO with authenticated user's ID
    createPostDto.userId = userId;

    return this.forumPostsService.create(createPostDto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all forum posts (Public)' })
  async findAll(@Query() query: QueryPostsDto) {
    return this.forumPostsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forum post by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.forumPostsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update forum post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
    @CurrentUser() user?: any,
  ) {
    // Get userId from authenticated user - ownership validated in service
    const userId = user.id;

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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete forum post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: any) {
    // Get userId and role from authenticated user
    const userId = user.id;
    const isAdmin = user.role === 'admin';
    // Service validates ownership or admin status

    return this.forumPostsService.remove(id, userId, isAdmin);
  }

  @Delete(':postId/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete image from forum post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  async removeImage(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @CurrentUser() user?: any,
  ) {
    // Get userId and role from authenticated user
    const userId = user.id;
    const isAdmin = user.role === 'admin';
    // Service validates ownership or admin status

    return this.forumPostsService.removeImage(postId, imageId, userId, isAdmin);
  }
}

