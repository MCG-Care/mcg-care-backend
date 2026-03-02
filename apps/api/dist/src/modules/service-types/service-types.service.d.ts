import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { QueryServiceTypesDto } from './dto/query-service-types.dto';
export declare class ServiceTypesService {
    create(createServiceTypeDto: CreateServiceTypeDto): Promise<{
        duration: number;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        serviceFee: string;
        generatesReminder: boolean;
        reminderIntervalMonths: number | null;
    }>;
    findAll(query: QueryServiceTypesDto): Promise<{
        data: {
            duration: number;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            serviceFee: string;
            generatesReminder: boolean;
            reminderIntervalMonths: number | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        duration: number;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        serviceFee: string;
        generatesReminder: boolean;
        reminderIntervalMonths: number | null;
    }>;
    update(id: number, updateServiceTypeDto: UpdateServiceTypeDto): Promise<{
        id: number;
        name: string;
        description: string | null;
        serviceFee: string;
        duration: number;
        generatesReminder: boolean;
        reminderIntervalMonths: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
