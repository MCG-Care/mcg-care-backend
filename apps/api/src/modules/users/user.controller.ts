import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  getUser(@Param('id') id: string, @CurrentUser() user?: any) {
    const requestedId = Number(id);
    
    // Users can view their own profile, admins can view any profile
    if (user.role !== 'admin' && user.id !== requestedId) {
      throw new ForbiddenException('You can only view your own profile');
    }
    
    return this.usersService.getUserById(requestedId);
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
}
