import { Database } from '../../config/database';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/address.dto';
export declare class UsersService {
    private readonly db;
    constructor(db: Database);
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
    getUserById(id: number, includeRating?: boolean): Promise<{
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
    getUserByEmail(email: string): Promise<{
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
    createUser(data: {
        name: string;
        email: string;
        password: string;
        phoneNo: string;
        role: 'customer' | 'technician' | 'admin';
        addressId: number;
    }): Promise<{
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
    createAddress(dto: AddressDto): Promise<{
        id: number;
        address: string | null;
        township: string;
        city: string;
        district: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: number, data: UpdateUserDto): Promise<{
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
    deleteUser(id: number): Promise<{
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
    getTechnicianAverageRating(technicianId: number): Promise<{
        technicianId: number;
        averageRating: number;
        totalFeedbacks: number;
        averageRatingRounded: number;
    }>;
    getAllTechnicianRatings(): Promise<{
        technicianId: number;
        technicianName: string;
        averageRating: number;
        averageRatingRounded: number;
        totalFeedbacks: number;
    }[]>;
}
