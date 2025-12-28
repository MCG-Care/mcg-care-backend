import { Injectable, UnauthorizedException } from '@nestjs/common';
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
      const address = await this.usersService.createAddress(data.address);
      const user = await this.usersService.createUser({
        name: data.name,
        email: data.email,
        phoneNo: data.phoneNo,
        role: data.role,
        password: hashed,
        addressId: address.id,
      });
      return this.generateToken(user);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  generateToken(user: any) {
    // Exclude password from user object
    const { password, ...userWithoutPassword } = user;
    
    return {
      access_token: this.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      user: userWithoutPassword,
    };
  }
}
