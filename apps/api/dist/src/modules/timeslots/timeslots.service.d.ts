import { CreateTimeslotDto } from './dto/create-timeslot.dto';
import { UpdateTimeslotDto } from './dto/update-timeslot.dto';
import { QueryTimeslotsDto } from './dto/query-timeslots.dto';
export declare class TimeslotsService {
    private readonly DEFAULT_SLOTS;
    private getLocalDateString;
    create(createTimeslotDto: CreateTimeslotDto): Promise<{
        date: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        technicianId: number;
        slots: number[];
    }>;
    findAll(query: QueryTimeslotsDto): Promise<{
        date: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        technicianId: number;
        slots: number[];
        technician: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
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
    }[]>;
    findOne(id: number): Promise<{
        date: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        technicianId: number;
        slots: number[];
        technician: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
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
    }>;
    update(id: number, updateTimeslotDto: UpdateTimeslotDto): Promise<{
        id: number;
        technicianId: number;
        date: string;
        slots: number[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    initializeTechnicianTimeslots(technicianId: number): Promise<{
        message: string;
        count: number;
    }>;
    dailyTimeslotMaintenance(): Promise<{
        message: string;
        deletedCount: number;
        addedCount: number;
        date: string;
    }>;
    getTechnicianAvailability(technicianId: number, startDate: string, endDate: string): Promise<{
        technicianId: number;
        startDate: string;
        endDate: string;
        timeslots: {
            date: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            technicianId: number;
            slots: number[];
        }[];
    }>;
    removeSlotsForBooking(technicianId: number, date: string, startHour: number, durationMinutes: number): Promise<{
        id: number;
        technicianId: number;
        date: string;
        slots: number[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    restoreSlotsForBooking(technicianId: number, date: string, startHour: number, durationMinutes: number): Promise<{
        id: number;
        technicianId: number;
        date: string;
        slots: number[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}
