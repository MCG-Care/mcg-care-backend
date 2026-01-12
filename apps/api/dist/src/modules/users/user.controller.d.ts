import { UsersService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddressDto } from './dto/address.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(user?: any): Promise<({
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
    getAllTechnicianRatings(user?: any): Promise<{
        technicianId: any;
        technicianName: any;
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
    updateUser(id: string, dto: UpdateUserDto, user?: any): Promise<{
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
    deleteUser(id: string, user?: any): Promise<{
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
    getUserAddresses(id: string, user?: any): Promise<{
        [x: string]: any;
    }[]>;
    addAddress(id: string, dto: AddressDto, user?: any): Promise<any>;
    updateAddress(id: string, addressId: string, dto: Partial<AddressDto>, user?: any): Promise<{
        [x: string]: any;
    }>;
    deleteAddress(id: string, addressId: string, user?: any): Promise<{
        message: string;
    }>;
    setPrimaryAddress(id: string, addressId: string, user?: any): Promise<{
        [x: string]: any;
    }>;
}
