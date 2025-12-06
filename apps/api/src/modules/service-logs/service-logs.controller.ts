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
import { ServiceLogsService } from './service-logs.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { UpdateServiceLogDto } from './dto/update-service-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('service-logs')
@UseGuards(JwtAuthGuard)
export class ServiceLogsController {
  constructor(private readonly serviceLogsService: ServiceLogsService) {}

  @Post()
  async create(
    @Body() createServiceLogDto: CreateServiceLogDto,
    @CurrentUser() user: any,
  ) {
    return this.serviceLogsService.create(
      user.id,
      user.role,
      createServiceLogDto,
    );
  }

  @Get('booking/:bookingId')
  async findByBookingId(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @CurrentUser() user: any,
  ) {
    return this.serviceLogsService.findByBookingId(
      bookingId,
      user.id,
      user.role,
    );
  }

  @Get('aircon/:airconId')
  async findByAirconId(
    @Param('airconId', ParseIntPipe) airconId: number,
    @CurrentUser() user: any,
  ) {
    return this.serviceLogsService.findByAirconId(
      airconId,
      user.id,
      user.role,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.serviceLogsService.findOne(id, user.id, user.role);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceLogDto: UpdateServiceLogDto,
    @CurrentUser() user: any,
  ) {
    return this.serviceLogsService.update(
      id,
      user.id,
      user.role,
      updateServiceLogDto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.serviceLogsService.remove(id, user.id, user.role);
  }
}

