import { Database } from '../../config/database';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/address.dto';
import { TimeslotsService } from '../timeslots/timeslots.service';
export declare class UsersService {
    private readonly db;
    private readonly timeslotsService;
    constructor(db: Database, timeslotsService: TimeslotsService);
    getAllUsers(): Promise<({
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    } | {
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    } | {
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    } | {
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    })[]>;
    getUserById(id: number, includeRating?: boolean): Promise<{
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    } | {
        averageRating: number;
        totalFeedbacks: number;
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    getUserByEmail(email: string): Promise<{
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        password: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    createUser(data: {
        name: string;
        email: string;
        password: string;
        phoneNo: string;
        role: 'customer' | 'technician' | 'admin';
        primaryAddressId?: number | null;
    }): Promise<any>;
    createAddress(userId: number, dto: AddressDto): Promise<any>;
    getUserAddresses(userId: number): Promise<{
        [x: string]: any;
    }[]>;
    getAddressById(addressId: number): Promise<{
        [x: string]: any;
    }>;
    updateAddress(addressId: number, userId: number, dto: Partial<AddressDto>): Promise<{
        [x: string]: any;
    }>;
    deleteAddress(addressId: number, userId: number): Promise<{
        message: string;
    }>;
    setPrimaryAddress(userId: number, addressId: number): Promise<{
        [x: string]: any;
    }>;
    updateUser(id: number, data: UpdateUserDto): Promise<{
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    deleteUser(id: number): Promise<{
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    } | {
        averageRating: number;
        totalFeedbacks: number;
        address: {
            id: any;
            name: any;
            address: any;
            township: any;
            city: any;
            district: any;
            createdAt: any;
            updatedAt: any;
        } | null;
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        role: any;
        primaryAddressId: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    getTechnicianAverageRating(technicianId: number): Promise<{
        technicianId: number;
        averageRating: number;
        totalFeedbacks: number;
        averageRatingRounded: number;
    }>;
    getAllTechnicianRatings(): Promise<{
        technicianId: any;
        technicianName: any;
        averageRating: number;
        averageRatingRounded: number;
        totalFeedbacks: number;
    }[]>;
}
