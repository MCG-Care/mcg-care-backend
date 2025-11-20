import { db } from '../../config/database';
type Database = typeof db;
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
    getUserById(id: number): Promise<{
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
    createUser(userData: {
        name: string;
        email: string;
        password: string;
        phoneNo: string;
        role: 'customer' | 'technician' | 'admin';
        addressId?: number;
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        phoneNo: string;
        addressId: number | null;
        role: "customer" | "technician" | "admin";
    }>;
    updateUser(id: number, userData: Partial<{
        name: string;
        email: string;
        phoneNo: string;
        addressId: number;
    }>): Promise<{
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
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        phoneNo: string;
        addressId: number | null;
        role: "customer" | "technician" | "admin";
    }>;
}
export {};
