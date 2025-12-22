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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { QueryServiceTypesDto } from './dto/query-service-types.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('service-types')
@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create service type (Admin only)' })
  async create(
    @Body() createServiceTypeDto: CreateServiceTypeDto,
    @CurrentUser() user: any,
  ) {
    // Only admins can create service types
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can create service types');
    }

    return this.serviceTypesService.create(createServiceTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service types (Public)' })
  async findAll(@Query() query: QueryServiceTypesDto) {
    // Public endpoint - anyone can view service types
    return this.serviceTypesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service type by ID (Public)' })
  @ApiParam({ name: 'id', description: 'Service Type ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // Public endpoint - anyone can view a service type
    return this.serviceTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update service type (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service Type ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceTypeDto: UpdateServiceTypeDto,
    @CurrentUser() user: any,
  ) {
    // Only admins can update service types
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can update service types');
    }

    return this.serviceTypesService.update(id, updateServiceTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete service type (Admin only)' })
  @ApiParam({ name: 'id', description: 'Service Type ID' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    // Only admins can delete service types
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete service types');
    }

    return this.serviceTypesService.remove(id);
  }
}




