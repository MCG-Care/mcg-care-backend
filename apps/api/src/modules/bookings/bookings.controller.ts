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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('bookings')
@ApiBearerAuth('JWT-auth')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking (Customer only)' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Get all bookings (filtered by user role)' })
  async findAll(@Query() query: QueryBookingsDto, @CurrentUser() user: any) {
    return this.bookingsService.findAll(user.id, user.role, query);
  }

  @Get('availability')
  @ApiOperation({
    summary: 'Get available timeslots per day for next 30 days (Customer only)',
    description:
      'Returns available time slots for each day where at least one technician from the same district can perform all selected services. ' +
      'Query parameters: airconId (required), serviceIds (required, can be comma-separated or multiple params), addressId (optional), date (optional, YYYY-MM-DD format). ' +
      'If date is provided, returns availability only for that date; otherwise returns 30 days. ' +
      'Example: /bookings/availability?airconId=1&serviceIds=1&serviceIds=2&addressId=3&date=2026-01-20',
  })
  async getAvailability(@Query() query: AvailabilityQueryDto, @CurrentUser() user: any) {
    // Only customers can check availability
    if (user.role !== 'customer') {
      throw new BadRequestException('Only customers can check availability');
    }

    return this.bookingsService.getAvailability(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.bookingsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.update(id, user.id, user.role, updateBookingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.bookingsService.remove(id, user.id, user.role);
  }

  @Delete(':bookingId/images/:imageId')
  @ApiOperation({ summary: 'Remove image from booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  async removeImage(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.removeImage(bookingId, imageId, user.id, user.role);
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
