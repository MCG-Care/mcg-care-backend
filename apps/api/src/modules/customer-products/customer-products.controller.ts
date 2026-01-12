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
import { CustomerProductsService } from './customer-products.service';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';
import { QueryCustomerProductsDto } from './dto/query-customer-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('customer-products')
@ApiBearerAuth('JWT-auth')
@Controller('customer-products')
@UseGuards(JwtAuthGuard)
export class CustomerProductsController {
  constructor(private readonly customerProductsService: CustomerProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Register customer product (Customer only)' })
  async create(
    @Body() createCustomerProductDto: CreateCustomerProductDto,
    @CurrentUser() user: any,
  ) {
    // Only customers can register products
    if (user.role !== 'customer') {
      throw new ForbiddenException('Only customers can register products');
    }

    return this.customerProductsService.create(user.id, createCustomerProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get customer products (filtered by user role)' })
  async findAll(@Query() query: QueryCustomerProductsDto, @CurrentUser() user: any) {
    // Customers can only see their own products
    // Admins can see all products or filter by customerId
    if (user.role !== 'customer' && user.role !== 'admin') {
      throw new ForbiddenException('Only customers and admins can view customer products');
    }

    // Customers see their own products, admins can see all or filter by customerId
    const customerId = user.role === 'customer' ? user.id : undefined;

    return this.customerProductsService.findAll(customerId, query);
  }

  @Get('qr/:qrUrl')
  @ApiOperation({ summary: 'Get customer product by QR code' })
  @ApiParam({ name: 'qrUrl', description: 'QR URL' })
  async findByQR(@Param('qrUrl') qrUrl: string, @CurrentUser() user: any) {
    // Technicians and admins can scan QR codes
    // Customers can also view their own products via QR
    if (user.role !== 'technician' && user.role !== 'admin' && user.role !== 'customer') {
      throw new ForbiddenException('Only technicians, admins, and customers can scan QR codes');
    }

    const product = await this.customerProductsService.findByQR(qrUrl);

    // Customers can only view their own products via QR
    if (user.role === 'customer' && product.customerId !== user.id) {
      throw new ForbiddenException('You can only view your own products');
    }

    return product;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer product by ID' })
  @ApiParam({ name: 'id', description: 'Customer Product ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    // Customers can only see their own products
    // Admins can see any product
    if (user.role !== 'customer' && user.role !== 'admin') {
      throw new ForbiddenException('Only customers and admins can view customer products');
    }

    const customerId = user.role === 'customer' ? user.id : undefined;
    const isAdmin = user.role === 'admin';

    return this.customerProductsService.findOne(id, customerId, isAdmin);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer product (Customer only)' })
  @ApiParam({ name: 'id', description: 'Customer Product ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerProductDto: UpdateCustomerProductDto,
    @CurrentUser() user: any,
  ) {
    // Only customers can update their own products
    if (user.role !== 'customer') {
      throw new ForbiddenException('Only customers can update their products');
    }

    return this.customerProductsService.update(id, user.id, updateCustomerProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer product (Customer only)' })
  @ApiParam({ name: 'id', description: 'Customer Product ID' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    // Only customers can delete their own products
    if (user.role !== 'customer') {
      throw new ForbiddenException('Only customers can delete their products');
    }

    return this.customerProductsService.remove(id, user.id);
  }
}
