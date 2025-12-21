import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(user?: any): Promise<{
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
    getAllTechnicianRatings(user?: any): Promise<{
        technicianId: number;
        technicianName: string;
        averageRating: number;
        averageRatingRounded: number;
        totalFeedbacks: number;
    }[]>;
    getTechnicianAverageRating(id: string): Promise<{
        technicianId: number;
        averageRating: number;
        totalFeedbacks: number;
        averageRatingRounded: number;
    }>;
    getUser(id: string, user?: any): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        phoneNo: string;
        addressId: number | null;
        role: "customer" | "technician" | "admin";
        createdAt: Date;
        updatedAt: Date;
    } | {
        averageRating: number;
        totalFeedbacks: number;
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
    updateUser(id: string, dto: UpdateUserDto, user?: any): Promise<{
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
    deleteUser(id: string, user?: any): Promise<{
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
