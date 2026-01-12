import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { UpdateServiceLogDto } from './dto/update-service-log.dto';
export declare class ServiceLogsService {
    create(userId: number, userRole: string, createServiceLogDto: CreateServiceLogDto): Promise<{
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
    findByBookingId(bookingId: number, userId: number, userRole: string): Promise<{
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
    findByAirconId(airconId: number, userId: number, userRole: string): Promise<{
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
    findOne(id: number, userId: number, userRole: string): Promise<{
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
    update(id: number, userId: number, userRole: string, updateServiceLogDto: UpdateServiceLogDto): Promise<{
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
    remove(id: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
}
