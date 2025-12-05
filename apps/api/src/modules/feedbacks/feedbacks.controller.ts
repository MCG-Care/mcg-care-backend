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
} from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { QueryFeedbacksDto } from './dto/query-feedbacks.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('feedbacks')
@UseGuards(JwtAuthGuard)
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() user: any,
  ) {
    return this.feedbacksService.create(user.id, user.role, createFeedbackDto);
  }

  @Get()
  async findAll(@Query() query: QueryFeedbacksDto, @CurrentUser() user: any) {
    return this.feedbacksService.findAll(user.id, user.role, query);
  }

  @Get('booking/:bookingId')
  async findByBookingId(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @CurrentUser() user: any,
  ) {
    return this.feedbacksService.findByBookingId(bookingId, user.id, user.role);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.feedbacksService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @CurrentUser() user: any,
  ) {
    return this.feedbacksService.update(id, user.id, user.role, updateFeedbackDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.feedbacksService.remove(id, user.id, user.role);
  }
}
