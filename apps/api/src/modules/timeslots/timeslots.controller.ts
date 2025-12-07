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
  ForbiddenException,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { TimeslotsService } from './timeslots.service';
import { CreateTimeslotDto } from './dto/create-timeslot.dto';
import { UpdateTimeslotDto } from './dto/update-timeslot.dto';
import { QueryTimeslotsDto } from './dto/query-timeslots.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('timeslots')
@ApiBearerAuth('JWT-auth')
@Controller('timeslots')
@UseGuards(JwtAuthGuard)
export class TimeslotsController {
  constructor(
    private readonly timeslotsService: TimeslotsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create timeslot (Admin only)' })
  async create(
    @Body() createTimeslotDto: CreateTimeslotDto,
    @CurrentUser() user: any,
  ) {
    // Only admins can manually create timeslots
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create timeslots');
    }

    return this.timeslotsService.create(createTimeslotDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all timeslots (filtered by user role)' })
  async findAll(@Query() query: QueryTimeslotsDto, @CurrentUser() user: any) {
    // Admins can view all timeslots
    // Technicians can view their own timeslots
    // Customers can view all timeslots (for booking purposes)
    if (user.role === 'technician' && !query.technicianId) {
      // If technician doesn't specify technicianId, default to their own
      query.technicianId = user.id;
    } else if (user.role === 'technician' && query.technicianId !== user.id) {
      throw new ForbiddenException('Technicians can only view their own timeslots');
    }

    return this.timeslotsService.findAll(query);
  }

  @Get('technician/:technicianId/availability')
  @ApiOperation({ summary: 'Get technician availability' })
  @ApiParam({ name: 'technicianId', description: 'Technician ID' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', required: true })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', required: true })
  async getTechnicianAvailability(
    @Param('technicianId', ParseIntPipe) technicianId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any,
  ) {
    // Anyone can check technician availability (for booking)
    if (!startDate || !endDate) {
      throw new ForbiddenException('startDate and endDate are required');
    }

    return this.timeslotsService.getTechnicianAvailability(
      technicianId,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get timeslot by ID' })
  @ApiParam({ name: 'id', description: 'Timeslot ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const timeslot = await this.timeslotsService.findOne(id);

    // Technicians can only view their own timeslots
    if (user.role === 'technician' && timeslot.technicianId !== user.id) {
      throw new ForbiddenException('You can only view your own timeslots');
    }

    return timeslot;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update timeslot (Admin only)' })
  @ApiParam({ name: 'id', description: 'Timeslot ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTimeslotDto: UpdateTimeslotDto,
    @CurrentUser() user: any,
  ) {
    // Only admins can update timeslots manually
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can update timeslots');
    }

    return this.timeslotsService.update(id, updateTimeslotDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete timeslot (Admin only)' })
  @ApiParam({ name: 'id', description: 'Timeslot ID' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Only admins can delete timeslots
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete timeslots');
    }

    return this.timeslotsService.remove(id);
  }

  @Post('technician/:technicianId/initialize')
  @ApiOperation({ summary: 'Initialize technician timeslots (Admin only)' })
  @ApiParam({ name: 'technicianId', description: 'Technician ID' })
  async initializeTechnician(
    @Param('technicianId', ParseIntPipe) technicianId: number,
    @CurrentUser() user: any,
  ) {
    // Only admins can initialize timeslots
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only admins can initialize technician timeslots',
      );
    }

    return this.timeslotsService.initializeTechnicianTimeslots(technicianId);
  }

  @Post('maintenance/daily')
  @ApiOperation({ summary: 'Run daily timeslot maintenance (Admin only)' })
  async dailyMaintenance(@CurrentUser() user: any) {
    // Only admins can trigger maintenance manually
    // (This is also run automatically by cron job)
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can trigger maintenance');
    }

    return this.timeslotsService.dailyTimeslotMaintenance();
  }

  @Post('maintenance/daily-cron')
  @ApiOperation({ summary: 'Run daily timeslot maintenance (Cron job endpoint - uses secret token)' })
  @ApiHeader({ name: 'X-Cron-Secret', description: 'Secret token for cron authentication' })
  async dailyMaintenanceCron(@Headers('x-cron-secret') cronSecret: string) {
    // This endpoint is for cron jobs only - uses a secret token instead of JWT
    // This avoids JWT expiration issues
    const expectedSecret = this.configService.get<string>('CRON_SECRET');
    
    if (!expectedSecret) {
      throw new UnauthorizedException('CRON_SECRET not configured');
    }

    if (!cronSecret || cronSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid cron secret token');
    }

    return this.timeslotsService.dailyTimeslotMaintenance();
  }
}




