import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { TechnicianServicesService } from './technician-services.service';
import { AssignServiceDto } from './dto/assign-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('technician-services')
@ApiBearerAuth('JWT-auth')
@Controller('technician-services')
@UseGuards(JwtAuthGuard)
export class TechnicianServicesController {
  constructor(private readonly technicianServicesService: TechnicianServicesService) {}

  @Post('assign')
  @ApiOperation({ summary: 'Assign services to technician (Admin or Technician)' })
  async assignServices(@Body() assignServiceDto: AssignServiceDto, @CurrentUser() user: any) {
    // Admins can assign services to any technician
    // Technicians can assign services to themselves only
    if (user.role !== 'admin' && user.role !== 'technician') {
      throw new ForbiddenException('Only admins and technicians can assign services');
    }

    // Technicians can only assign services to themselves
    if (user.role === 'technician' && assignServiceDto.technicianId !== user.id) {
      throw new ForbiddenException('Technicians can only assign services to themselves');
    }

    return this.technicianServicesService.assignServices(assignServiceDto);
  }

  @Get('technician/:technicianId')
  @ApiOperation({ summary: 'Get services for a technician' })
  @ApiParam({ name: 'technicianId', description: 'Technician ID' })
  async getTechnicianServices(
    @Param('technicianId', ParseIntPipe) technicianId: number,
    @CurrentUser() user: any,
  ) {
    // Admins can view any technician's services
    // Technicians can view their own services
    if (user.role !== 'admin' && user.role !== 'technician') {
      throw new ForbiddenException('Only admins and technicians can view technician services');
    }

    if (user.role === 'technician' && user.id !== technicianId) {
      throw new ForbiddenException('You can only view your own services');
    }

    return this.technicianServicesService.getTechnicianServices(technicianId);
  }

  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Get technicians for a service (Admin only)' })
  @ApiParam({ name: 'serviceId', description: 'Service Type ID' })
  async getTechniciansForService(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @CurrentUser() user: any,
  ) {
    // Only admins can view which technicians can perform a service
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view technicians for a service');
    }

    return this.technicianServicesService.getTechniciansForService(serviceId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all technicians with their services (Admin only)' })
  async getAllTechniciansWithServices(@CurrentUser() user: any) {
    // Only admins can view all technicians with services
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view all technicians with services');
    }

    return this.technicianServicesService.getAllTechniciansWithServices();
  }

  @Delete('technician/:technicianId/service/:serviceId')
  @ApiOperation({ summary: 'Remove service from technician (Admin or Technician)' })
  @ApiParam({ name: 'technicianId', description: 'Technician ID' })
  @ApiParam({ name: 'serviceId', description: 'Service Type ID' })
  async removeService(
    @Param('technicianId', ParseIntPipe) technicianId: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @CurrentUser() user: any,
  ) {
    // Admins can remove services from any technician
    // Technicians can remove services from themselves only
    if (user.role !== 'admin' && user.role !== 'technician') {
      throw new ForbiddenException('Only admins and technicians can remove services');
    }

    // Technicians can only remove their own services
    if (user.role === 'technician' && technicianId !== user.id) {
      throw new ForbiddenException('Technicians can only remove their own services');
    }

    return this.technicianServicesService.removeService(technicianId, serviceId);
  }
}
