import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  ForbiddenException,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { TimeOffRequestsService } from './time-off-requests.service';
import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';
import { QueryTimeOffRequestsDto } from './dto/query-time-off-requests.dto';
import { ReviewTimeOffRequestDto } from './dto/review-time-off-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('time-off-requests')
@ApiBearerAuth('JWT-auth')
@Controller('time-off-requests')
export class TimeOffRequestsController {
  constructor(private readonly timeOffRequestsService: TimeOffRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create time-off request (Technician only)' })
  async create(
    @Body() createDto: CreateTimeOffRequestDto,
    @CurrentUser() user: any,
  ) {
    // Only technicians can create time-off requests
    if (user.role !== 'technician') {
      throw new ForbiddenException('Only technicians can create time-off requests');
    }

    return this.timeOffRequestsService.create(user.id, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all time-off requests (filtered by user role)',
    description:
      'Admins can view all requests. Technicians can only view their own requests.',
  })
  async findAll(@Query() query: QueryTimeOffRequestsDto, @CurrentUser() user: any) {
    // Technicians can only view their own requests
    if (user.role === 'technician') {
      query.technicianId = user.id;
    }
    // Admins can view all requests (no filtering needed)

    return this.timeOffRequestsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get time-off request by ID' })
  @ApiParam({ name: 'id', description: 'Time-off request ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const request = await this.timeOffRequestsService.findOne(id);

    // Technicians can only view their own requests
    if (user.role === 'technician' && request.technicianId !== user.id) {
      throw new ForbiddenException('You can only view your own time-off requests');
    }

    return request;
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Review time-off request (Admin only)',
    description: 'Approve or reject a time-off request. If approved, timeslots are automatically blocked.',
  })
  @ApiParam({ name: 'id', description: 'Time-off request ID' })
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewDto: ReviewTimeOffRequestDto,
    @CurrentUser() user: any,
  ) {
    // Only admins can review requests
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can review time-off requests');
    }

    return this.timeOffRequestsService.review(id, user.id, reviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete time-off request',
    description: 'Technicians can delete their own pending requests. Admins can delete any pending request.',
  })
  @ApiParam({ name: 'id', description: 'Time-off request ID' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.timeOffRequestsService.remove(id, user.id, user.role);
  }
}
