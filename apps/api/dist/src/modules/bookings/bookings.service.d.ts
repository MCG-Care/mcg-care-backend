import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { SupabaseService } from '../../config/supabase.service';
export declare class BookingsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    create(customerId: number, createBookingDto: CreateBookingDto, imageFiles?: Express.Multer.File[]): Promise<{
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
        aircon: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        bookingImages: {
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
    private findAvailableTechnician;
    private checkTechnicianAvailability;
    private updateTimeslots;
    private shuffleArray;
    findAll(userId: number, userRole: string, query: QueryBookingsDto): Promise<{
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
            aircon: {
                [x: string]: any;
            } | {
                [x: string]: any;
            }[];
            bookingImages: {
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
    findOne(id: number, userId: number, userRole: string): Promise<{
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
        aircon: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        bookingImages: {
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
    update(id: number, userId: number, userRole: string, updateBookingDto: UpdateBookingDto): Promise<{
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
        aircon: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        bookingImages: {
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
    remove(id: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
    private restoreTimeslots;
    removeImage(bookingId: number, imageId: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
    private uploadBookingImages;
}
