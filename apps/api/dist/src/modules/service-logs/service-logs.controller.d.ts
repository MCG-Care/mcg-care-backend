import { ServiceLogsService } from './service-logs.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { UpdateServiceLogDto } from './dto/update-service-log.dto';
export declare class ServiceLogsController {
    private readonly serviceLogsService;
    constructor(serviceLogsService: ServiceLogsService);
    create(createServiceLogDto: CreateServiceLogDto, user: any): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string;
        booking: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    findByBookingId(bookingId: number, user: any): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string;
        booking: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    findByAirconId(airconId: number, user: any): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string;
        booking: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }[]>;
    findOne(id: number, user: any): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string;
        booking: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    update(id: number, updateServiceLogDto: UpdateServiceLogDto, user: any): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string;
        booking: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
}
