import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { SupabaseService } from '../../config/supabase.service';
import { MaintenanceRemindersService } from '../maintenance-reminders/maintenance-reminders.service';
export declare class BookingsService {
    private readonly supabaseService;
    private readonly maintenanceRemindersService;
    constructor(supabaseService: SupabaseService, maintenanceRemindersService: MaintenanceRemindersService);
    create(customerId: number, createBookingDto: CreateBookingDto, imageFiles?: Express.Multer.File[]): Promise<any>;
    private findAvailableTechnician;
    private checkTechnicianAvailability;
    private updateTimeslots;
    private shuffleArray;
    findAll(userId: number, userRole: string, query: QueryBookingsDto): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number, userId: number, userRole: string): Promise<any>;
    update(id: number, userId: number, userRole: string, updateBookingDto: UpdateBookingDto, imageFiles?: Express.Multer.File[]): Promise<any>;
    remove(id: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
    private restoreTimeslots;
    removeImage(bookingId: number, imageId: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
    getAvailability(customerId: number, query: AvailabilityQueryDto): Promise<{
        date: string;
        availableSlots: number[];
    }[]>;
    private getAvailabilityForDate;
    private generateEmptyAvailability;
    private uploadBookingImages;
}
