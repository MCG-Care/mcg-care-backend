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
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { QueryServiceTypesDto } from './dto/query-service-types.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
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
  async findAll(@Query() query: QueryServiceTypesDto) {
    // Public endpoint - anyone can view service types
    return this.serviceTypesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    // Public endpoint - anyone can view a service type
    return this.serviceTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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


