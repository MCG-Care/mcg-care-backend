import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto, images: Express.Multer.File[], user: any): Promise<any>;
    findAll(query: QueryBookingsDto, user: any): Promise<{
        data: any[];
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
    findOne(id: number, user: any): Promise<any>;
    update(id: number, updateBookingDto: UpdateBookingDto, user: any): Promise<any>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
    removeImage(bookingId: number, imageId: number, user: any): Promise<{
        message: string;
    }>;
    private validateImages;
}
