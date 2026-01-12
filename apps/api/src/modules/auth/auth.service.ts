import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
  ) {}

  async register(data: CreateUserDto) {
    try {
      const hashed = await bcrypt.hash(data.password, 10);
      // Create user first (without address)
      const user = await this.usersService.createUser({
        name: data.name,
        email: data.email,
        phoneNo: data.phoneNo,
        role: data.role,
        password: hashed,
      });
      
      // Create address and set as primary
      const address = await this.usersService.createAddress(user.id, data.address);
      await this.usersService.setPrimaryAddress(user.id, address.id);
      
      // Fetch updated user with address
      const userWithAddress = await this.usersService.getUserById(user.id);
      return this.generateToken(userWithAddress);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.usersService.getUserByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.password) {
        console.error('User found but password is missing:', email);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const result = this.generateToken(user);
      return result;
    } catch (err) {
      // If it's already an UnauthorizedException, re-throw it
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      // Log other errors for debugging
      console.error('Login error:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      // Re-throw as InternalServerErrorException
      throw new InternalServerErrorException('An error occurred during login. Please try again.');
    }
  }

  generateToken(user: any) {
    try {
      // Exclude password from user object
      const { password, ...userWithoutPassword } = user;
      
      // Helper function to safely convert dates to ISO strings
      const toISOString = (date: any): string | null => {
        if (!date) return null;
        try {
          const dateObj = date instanceof Date ? date : new Date(date);
          if (isNaN(dateObj.getTime())) return null;
          return dateObj.toISOString();
        } catch {
          return null;
        }
      };
      
      // Ensure dates are properly serialized
      const sanitizedUser: any = {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        phoneNo: userWithoutPassword.phoneNo,
        role: userWithoutPassword.role,
        primaryAddressId: userWithoutPassword.primaryAddressId ?? null,
        createdAt: toISOString(userWithoutPassword.createdAt),
        updatedAt: toISOString(userWithoutPassword.updatedAt),
      };
      
      // Handle address if present
      if (userWithoutPassword.address && typeof userWithoutPassword.address === 'object') {
        sanitizedUser.address = {
          id: userWithoutPassword.address.id ?? null,
          name: userWithoutPassword.address.name ?? null,
          address: userWithoutPassword.address.address ?? null,
          township: userWithoutPassword.address.township ?? null,
          city: userWithoutPassword.address.city ?? null,
          district: userWithoutPassword.address.district ?? null,
          createdAt: toISOString(userWithoutPassword.address.createdAt),
          updatedAt: toISOString(userWithoutPassword.address.updatedAt),
        };
      } else {
        sanitizedUser.address = null;
      }
      
      return {
        access_token: this.jwt.sign({
          sub: user.id,
          email: user.email,
          role: user.role,
        }),
        user: sanitizedUser,
      };
    } catch (error) {
      console.error('Error in generateToken:', error);
      throw new InternalServerErrorException('Failed to generate authentication token');
    }
  }
}
