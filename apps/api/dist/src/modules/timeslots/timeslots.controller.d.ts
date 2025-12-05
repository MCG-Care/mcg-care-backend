import { TimeslotsService } from './timeslots.service';
import { CreateTimeslotDto } from './dto/create-timeslot.dto';
import { UpdateTimeslotDto } from './dto/update-timeslot.dto';
import { QueryTimeslotsDto } from './dto/query-timeslots.dto';
export declare class TimeslotsController {
    private readonly timeslotsService;
    constructor(timeslotsService: TimeslotsService);
    create(createTimeslotDto: CreateTimeslotDto, user: any): Promise<{
        date: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        technicianId: number;
        slots: number[];
    }>;
    findAll(query: QueryTimeslotsDto, user: any): Promise<{
        date: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        technicianId: number;
        slots: number[];
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
    }[]>;
    getTechnicianAvailability(technicianId: number, startDate: string, endDate: string, user: any): Promise<{
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
    findOne(id: number, user: any): Promise<{
        date: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        technicianId: number;
        slots: number[];
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
    }>;
    update(id: number, updateTimeslotDto: UpdateTimeslotDto, user: any): Promise<{
        id: number;
        technicianId: number;
        date: string;
        slots: number[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
    initializeTechnician(technicianId: number, user: any): Promise<{
        message: string;
        count: number;
    }>;
    dailyMaintenance(user: any): Promise<{
        message: string;
        deletedCount: number;
        addedCount: number;
        date: string;
    }>;
}
