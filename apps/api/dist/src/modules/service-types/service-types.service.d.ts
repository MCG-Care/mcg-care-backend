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
    }>;
    update(id: number, updateServiceTypeDto: UpdateServiceTypeDto): Promise<{
        id: number;
        name: string;
        description: string | null;
        serviceFee: string;
        duration: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
