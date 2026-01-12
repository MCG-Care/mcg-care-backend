import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  getAllUsers(@CurrentUser() user?: any) {
    // Simple role check - admin only
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view all users');
    }

    return this.usersService.getAllUsers();
  }

  @Get('technicians/ratings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get average ratings for all technicians (Admin only)' })
  getAllTechnicianRatings(@CurrentUser() user?: any) {
    // Admin only - to view all technician ratings
    // This route must come before :id routes to avoid route conflicts
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view all technician ratings');
    }

    return this.usersService.getAllTechnicianRatings();
  }

  @Get(':id/average-rating')
  @ApiOperation({ summary: 'Get average rating for a technician (Public)' })
  @ApiParam({ name: 'id', description: 'Technician ID' })
  getTechnicianAverageRating(@Param('id') id: string) {
    // Public endpoint - anyone can view technician ratings
    return this.usersService.getTechnicianAverageRating(Number(id));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID (includes average rating for technicians)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  getUser(@Param('id') id: string, @CurrentUser() user?: any) {
    const requestedId = Number(id);

    // Users can view their own profile, admins can view any profile
    if (user.role !== 'admin' && user.id !== requestedId) {
      throw new ForbiddenException('You can only view your own profile');
    }

    // Include rating for technicians
    return this.usersService.getUserById(requestedId, true);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user?: any) {
    const requestedId = Number(id);

    // Users can update their own profile, admins can update any profile
    if (user.role !== 'admin' && user.id !== requestedId) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.updateUser(requestedId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  deleteUser(@Param('id') id: string, @CurrentUser() user?: any) {
    // Simple role check - admin only
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete users');
    }

    return this.usersService.deleteUser(Number(id));
  }

  @Get(':id/addresses')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all addresses for a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  getUserAddresses(@Param('id') id: string, @CurrentUser() user?: any) {
    const requestedId = Number(id);

    // Users can view their own addresses, admins can view any user's addresses
    if (user.role !== 'admin' && user.id !== requestedId) {
      throw new ForbiddenException('You can only view your own addresses');
    }

    return this.usersService.getUserAddresses(requestedId);
  }

  @Post(':id/addresses')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a new address for a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  addAddress(
    @Param('id') id: string,
    @Body() dto: AddressDto,
    @CurrentUser() user?: any,
  ) {
    const requestedId = Number(id);

    // Users can add addresses to their own account, admins can add to any account
    if (user.role !== 'admin' && user.id !== requestedId) {
      throw new ForbiddenException('You can only add addresses to your own account');
    }

    return this.usersService.createAddress(requestedId, dto);
  }

  @Patch(':id/addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'addressId', description: 'Address ID' })
  updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() dto: Partial<AddressDto>,
    @CurrentUser() user?: any,
  ) {
    const requestedId = Number(id);

    // Users can update their own addresses, admins can update any address
    if (user.role !== 'admin' && user.id !== requestedId) {
      throw new ForbiddenException('You can only update your own addresses');
    }

    return this.usersService.updateAddress(Number(addressId), requestedId, dto);
  }

  @Delete(':id/addresses/:addressId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an address' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'addressId', description: 'Address ID' })
  deleteAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @CurrentUser() user?: any,
  ) {
    const requestedId = Number(id);

    // Users can delete their own addresses, admins can delete any address
    if (user.role !== 'admin' && user.id !== requestedId) {
      throw new ForbiddenException('You can only delete your own addresses');
    }

    return this.usersService.deleteAddress(Number(addressId), requestedId);
  }

  @Patch(':id/primary-address/:addressId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set primary address' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiParam({ name: 'addressId', description: 'Address ID' })
  setPrimaryAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @CurrentUser() user?: any,
  ) {
    const requestedId = Number(id);

    // Users can set their own primary address, admins can set for any user
    if (user.role !== 'admin' && user.id !== requestedId) {
      throw new ForbiddenException('You can only set your own primary address');
    }

    return this.usersService.setPrimaryAddress(requestedId, Number(addressId));
  }
}
