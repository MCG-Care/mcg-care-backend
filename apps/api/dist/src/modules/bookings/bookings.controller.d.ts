import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
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
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        bookingServices: {
            [x: string]: any;
        }[];
        bookingImages: {
            [x: string]: any;
        }[];
        aircon: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        serviceLog: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[] | null;
        feedback: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[] | null;
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
                [x: string]: any;
            } | {
                [x: string]: any;
            }[];
            bookingServices: {
                [x: string]: any;
            }[];
            bookingImages: {
                [x: string]: any;
            }[];
            aircon: {
                [x: string]: any;
            } | {
                [x: string]: any;
            }[];
            serviceLog: {
                [x: string]: any;
            } | {
                [x: string]: any;
            }[] | null;
            feedback: {
                [x: string]: any;
            } | {
                [x: string]: any;
            }[] | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAvailability(query: AvailabilityQueryDto, user: any): Promise<{
        date: string;
        availableSlots: number[];
    }[]>;
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
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        bookingServices: {
            [x: string]: any;
        }[];
        bookingImages: {
            [x: string]: any;
        }[];
        aircon: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        serviceLog: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[] | null;
        feedback: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[] | null;
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
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        bookingServices: {
            [x: string]: any;
        }[];
        bookingImages: {
            [x: string]: any;
        }[];
        aircon: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        serviceLog: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[] | null;
        feedback: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[] | null;
    }>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
    removeImage(bookingId: number, imageId: number, user: any): Promise<{
        message: string;
    }>;
    private validateImages;
}
