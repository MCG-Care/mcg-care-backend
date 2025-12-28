import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(user?: any): Promise<{
        address: {
            id: number;
            address: string | null;
            township: string;
            city: string;
            district: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        name: string;
        email: string;
        phoneNo: string;
        role: "customer" | "technician" | "admin";
        addressId: number | null;
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
        address: {
            id: number;
            address: string | null;
            township: string;
            city: string;
            district: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        name: string;
        email: string;
        phoneNo: string;
        role: "customer" | "technician" | "admin";
        addressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | {
        averageRating: number;
        totalFeedbacks: number;
        address: {
            id: number;
            address: string | null;
            township: string;
            city: string;
            district: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        name: string;
        email: string;
        phoneNo: string;
        role: "customer" | "technician" | "admin";
        addressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateUser(id: string, dto: UpdateUserDto, user?: any): Promise<{
        address: {
            id: number;
            address: string | null;
            township: string;
            city: string;
            district: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        name: string;
        email: string;
        phoneNo: string;
        role: "customer" | "technician" | "admin";
        addressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    deleteUser(id: string, user?: any): Promise<{
        address: {
            id: number;
            address: string | null;
            township: string;
            city: string;
            district: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        name: string;
        email: string;
        phoneNo: string;
        role: "customer" | "technician" | "admin";
        addressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | {
        averageRating: number;
        totalFeedbacks: number;
        address: {
            id: number;
            address: string | null;
            township: string;
            city: string;
            district: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        id: number;
        name: string;
        email: string;
        phoneNo: string;
        role: "customer" | "technician" | "admin";
        addressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
