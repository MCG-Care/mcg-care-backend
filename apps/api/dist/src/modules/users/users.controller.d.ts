import { UsersService } from './users.service';
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
}
