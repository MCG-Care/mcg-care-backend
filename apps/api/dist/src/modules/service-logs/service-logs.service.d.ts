import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { UpdateServiceLogDto } from './dto/update-service-log.dto';
export declare class ServiceLogsService {
    create(userId: number, userRole: string, createServiceLogDto: CreateServiceLogDto): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string;
        booking: {
            duration: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            technicianId: number;
            airconId: number;
            bookingOnDate: string;
            bookingForDate: string;
            bookingTime: string;
            fees: string;
            status: "pending" | "inprogress" | "done" | "unsuccessful";
            technician: {
                password: string;
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phoneNo: string;
                addressId: number | null;
                role: "customer" | "technician" | "admin";
            };
            bookingServices: {
                createdAt: Date;
                serviceId: number;
                bookingId: number;
                service: {
                    duration: number;
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    serviceFee: string;
                };
            }[];
            aircon: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
                customerId: number;
                purchaseDate: string | null;
                qrUrl: string | null;
                purchaseCode: string | null;
                customer: {
                    password: string;
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    phoneNo: string;
                    addressId: number | null;
                    role: "customer" | "technician" | "admin";
                };
                product: {
                    id: number;
                    brand: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productModel: string;
                    price: string | null;
                    description: string | null;
                    capacity: string | null;
                    type: "split" | "window" | "cassette" | "portable" | "central";
                    energyRating: number | null;
                    coolingPower: number | null;
                    refrigerant: string | null;
                    warranty: number | null;
                    tagline: string | null;
                    voltageAverage: number | null;
                    voltageCount: number | null;
                    releaseDate: string | null;
                };
            };
        };
    }>;
    findByBookingId(bookingId: number, userId: number, userRole: string): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string;
        booking: {
            duration: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            technicianId: number;
            airconId: number;
            bookingOnDate: string;
            bookingForDate: string;
            bookingTime: string;
            fees: string;
            status: "pending" | "inprogress" | "done" | "unsuccessful";
            technician: {
                password: string;
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phoneNo: string;
                addressId: number | null;
                role: "customer" | "technician" | "admin";
            };
            bookingServices: {
                createdAt: Date;
                serviceId: number;
                bookingId: number;
                service: {
                    duration: number;
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    serviceFee: string;
                };
            }[];
            aircon: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
                customerId: number;
                purchaseDate: string | null;
                qrUrl: string | null;
                purchaseCode: string | null;
                customer: {
                    password: string;
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    phoneNo: string;
                    addressId: number | null;
                    role: "customer" | "technician" | "admin";
                };
                product: {
                    id: number;
                    brand: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productModel: string;
                    price: string | null;
                    description: string | null;
                    capacity: string | null;
                    type: "split" | "window" | "cassette" | "portable" | "central";
                    energyRating: number | null;
                    coolingPower: number | null;
                    refrigerant: string | null;
                    warranty: number | null;
                    tagline: string | null;
                    voltageAverage: number | null;
                    voltageCount: number | null;
                    releaseDate: string | null;
                };
            };
        };
    }>;
    findOne(id: number, userId: number, userRole: string): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string;
        booking: {
            duration: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            technicianId: number;
            airconId: number;
            bookingOnDate: string;
            bookingForDate: string;
            bookingTime: string;
            fees: string;
            status: "pending" | "inprogress" | "done" | "unsuccessful";
            technician: {
                password: string;
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phoneNo: string;
                addressId: number | null;
                role: "customer" | "technician" | "admin";
            };
            bookingServices: {
                createdAt: Date;
                serviceId: number;
                bookingId: number;
                service: {
                    duration: number;
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    serviceFee: string;
                };
            }[];
            aircon: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
                customerId: number;
                purchaseDate: string | null;
                qrUrl: string | null;
                purchaseCode: string | null;
                customer: {
                    password: string;
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    phoneNo: string;
                    addressId: number | null;
                    role: "customer" | "technician" | "admin";
                };
                product: {
                    id: number;
                    brand: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productModel: string;
                    price: string | null;
                    description: string | null;
                    capacity: string | null;
                    type: "split" | "window" | "cassette" | "portable" | "central";
                    energyRating: number | null;
                    coolingPower: number | null;
                    refrigerant: string | null;
                    warranty: number | null;
                    tagline: string | null;
                    voltageAverage: number | null;
                    voltageCount: number | null;
                    releaseDate: string | null;
                };
            };
        };
    }>;
    update(id: number, userId: number, userRole: string, updateServiceLogDto: UpdateServiceLogDto): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string;
        booking: {
            duration: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            technicianId: number;
            airconId: number;
            bookingOnDate: string;
            bookingForDate: string;
            bookingTime: string;
            fees: string;
            status: "pending" | "inprogress" | "done" | "unsuccessful";
            technician: {
                password: string;
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phoneNo: string;
                addressId: number | null;
                role: "customer" | "technician" | "admin";
            };
            bookingServices: {
                createdAt: Date;
                serviceId: number;
                bookingId: number;
                service: {
                    duration: number;
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    serviceFee: string;
                };
            }[];
            aircon: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
                customerId: number;
                purchaseDate: string | null;
                qrUrl: string | null;
                purchaseCode: string | null;
                customer: {
                    password: string;
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    phoneNo: string;
                    addressId: number | null;
                    role: "customer" | "technician" | "admin";
                };
                product: {
                    id: number;
                    brand: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    productModel: string;
                    price: string | null;
                    description: string | null;
                    capacity: string | null;
                    type: "split" | "window" | "cassette" | "portable" | "central";
                    energyRating: number | null;
                    coolingPower: number | null;
                    refrigerant: string | null;
                    warranty: number | null;
                    tagline: string | null;
                    voltageAverage: number | null;
                    voltageCount: number | null;
                    releaseDate: string | null;
                };
            };
        };
    }>;
    remove(id: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
}
