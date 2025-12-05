import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto, images: Express.Multer.File[], user: any): Promise<{
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
            address: {
                id: number;
                address: string | null;
                township: string;
                city: string;
                district: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
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
                address: {
                    id: number;
                    address: string | null;
                    township: string;
                    city: string;
                    district: string;
                    createdAt: Date;
                    updatedAt: Date;
                } | null;
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
        bookingImages: {
            url: string;
            id: number;
            createdAt: Date;
            bookingId: number;
        }[];
        serviceLog: {
            id: number;
            createdAt: Date;
            bookingId: number;
            note: string;
        } | null;
        feedback: {
            id: number;
            createdAt: Date;
            bookingId: number;
            note: string | null;
            rating: number;
            satisfaction: number | null;
            issueResolved: boolean | null;
        } | null;
    }>;
    findAll(query: QueryBookingsDto, user: any): Promise<{
        data: {
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
                address: {
                    id: number;
                    address: string | null;
                    township: string;
                    city: string;
                    district: string;
                    createdAt: Date;
                    updatedAt: Date;
                } | null;
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
            bookingImages: {
                url: string;
                id: number;
                createdAt: Date;
                bookingId: number;
            }[];
            serviceLog: {
                id: number;
                createdAt: Date;
                bookingId: number;
                note: string;
            } | null;
            feedback: {
                id: number;
                createdAt: Date;
                bookingId: number;
                note: string | null;
                rating: number;
                satisfaction: number | null;
                issueResolved: boolean | null;
            } | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number, user: any): Promise<{
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
            address: {
                id: number;
                address: string | null;
                township: string;
                city: string;
                district: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
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
                address: {
                    id: number;
                    address: string | null;
                    township: string;
                    city: string;
                    district: string;
                    createdAt: Date;
                    updatedAt: Date;
                } | null;
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
        bookingImages: {
            url: string;
            id: number;
            createdAt: Date;
            bookingId: number;
        }[];
        serviceLog: {
            id: number;
            createdAt: Date;
            bookingId: number;
            note: string;
        } | null;
        feedback: {
            id: number;
            createdAt: Date;
            bookingId: number;
            note: string | null;
            rating: number;
            satisfaction: number | null;
            issueResolved: boolean | null;
        } | null;
    }>;
    update(id: number, updateBookingDto: UpdateBookingDto, user: any): Promise<{
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
            address: {
                id: number;
                address: string | null;
                township: string;
                city: string;
                district: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
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
                address: {
                    id: number;
                    address: string | null;
                    township: string;
                    city: string;
                    district: string;
                    createdAt: Date;
                    updatedAt: Date;
                } | null;
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
        bookingImages: {
            url: string;
            id: number;
            createdAt: Date;
            bookingId: number;
        }[];
        serviceLog: {
            id: number;
            createdAt: Date;
            bookingId: number;
            note: string;
        } | null;
        feedback: {
            id: number;
            createdAt: Date;
            bookingId: number;
            note: string | null;
            rating: number;
            satisfaction: number | null;
            issueResolved: boolean | null;
        } | null;
    }>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
    removeImage(bookingId: number, imageId: number, user: any): Promise<{
        message: string;
    }>;
    private validateImages;
}
