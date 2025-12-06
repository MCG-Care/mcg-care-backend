import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 images
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @UploadedFiles() images: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    // Only customers can create bookings
    if (user.role !== 'customer') {
      throw new BadRequestException('Only customers can create bookings');
    }

    // Validate images if provided
    if (images && images.length > 0) {
      this.validateImages(images);
    }

    return this.bookingsService.create(user.id, createBookingDto, images);
  }

  @Get()
  async findAll(@Query() query: QueryBookingsDto, @CurrentUser() user: any) {
    return this.bookingsService.findAll(user.id, user.role, query);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.update(id, user.id, user.role, updateBookingDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.remove(id, user.id, user.role);
  }

  @Delete(':bookingId/images/:imageId')
  async removeImage(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.removeImage(
      bookingId,
      imageId,
      user.id,
      user.role,
    );
  }

  /**
   * Validate uploaded images
   */
  private validateImages(files: Express.Multer.File[]) {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are allowed.`,
        );
      }

      if (file.size > maxSize) {
        throw new BadRequestException(
          `File ${file.originalname} is too large. Maximum size is 5MB.`,
        );
      }
    }
  }
}

