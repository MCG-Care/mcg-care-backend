import { Database } from '../../config/database';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/address.dto';
export declare class UsersService {
    private readonly db;
    constructor(db: Database);
    getAllUsers(): Promise<{
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
    getUserById(id: number, includeRating?: boolean): Promise<{
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
    getUserByEmail(email: string): Promise<{
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
        password: string;
        phoneNo: string;
        role: "customer" | "technician" | "admin";
        addressId: number | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    createUser(data: {
        name: string;
        email: string;
        password: string;
        phoneNo: string;
        role: 'customer' | 'technician' | 'admin';
        addressId: number;
    }): Promise<{
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
    deleteUser(id: number): Promise<{
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
