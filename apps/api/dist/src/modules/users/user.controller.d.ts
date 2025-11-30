import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        phoneNo: string;
        addressId: number | null;
        role: "customer" | "technician" | "admin";
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getUser(id: string): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        phoneNo: string;
        addressId: number | null;
        role: "customer" | "technician" | "admin";
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        phoneNo: string;
        addressId: number | null;
        role: "customer" | "technician" | "admin";
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        password: string;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phoneNo: string;
        addressId: number | null;
        role: "customer" | "technician" | "admin";
    }>;
}
