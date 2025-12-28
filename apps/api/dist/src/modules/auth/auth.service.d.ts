import { UsersService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthService {
    private usersService;
    private jwt;
    constructor(usersService: UsersService, jwt: JwtService);
    register(data: CreateUserDto): Promise<{
        access_token: string;
        user: any;
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
        user: any;
    }>;
    generateToken(user: any): {
        access_token: string;
        user: any;
    };
}
