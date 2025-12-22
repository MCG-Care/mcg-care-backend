import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ServiceLogsService } from './service-logs.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { UpdateServiceLogDto } from './dto/update-service-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('service-logs')
@ApiBearerAuth('JWT-auth')
@Controller('service-logs')
@UseGuards(JwtAuthGuard)
export class ServiceLogsController {
  constructor(private readonly serviceLogsService: ServiceLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create service log' })
  async create(@Body() createServiceLogDto: CreateServiceLogDto, @CurrentUser() user: any) {
    return this.serviceLogsService.create(user.id, user.role, createServiceLogDto);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get service logs for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  async findByBookingId(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @CurrentUser() user: any,
  ) {
    return this.serviceLogsService.findByBookingId(bookingId, user.id, user.role);
  }

  @Get('aircon/:airconId')
  @ApiOperation({ summary: 'Get service logs for an aircon' })
  @ApiParam({ name: 'airconId', description: 'Customer Product (Aircon) ID' })
  async findByAirconId(
    @Param('airconId', ParseIntPipe) airconId: number,
    @CurrentUser() user: any,
  ) {
    return this.serviceLogsService.findByAirconId(airconId, user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service log by ID' })
  @ApiParam({ name: 'id', description: 'Service Log ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.serviceLogsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service log' })
  @ApiParam({ name: 'id', description: 'Service Log ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceLogDto: UpdateServiceLogDto,
    @CurrentUser() user: any,
  ) {
    return this.serviceLogsService.update(id, user.id, user.role, updateServiceLogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service log' })
  @ApiParam({ name: 'id', description: 'Service Log ID' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.serviceLogsService.remove(id, user.id, user.role);
  }
}
