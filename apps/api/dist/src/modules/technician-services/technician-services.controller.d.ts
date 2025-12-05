import { TechnicianServicesService } from './technician-services.service';
import { AssignServiceDto } from './dto/assign-service.dto';
export declare class TechnicianServicesController {
    private readonly technicianServicesService;
    constructor(technicianServicesService: TechnicianServicesService);
    assignServices(assignServiceDto: AssignServiceDto, user: any): Promise<{
        technicianId: number;
        technicianName: string;
        services: {
            duration: number;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            serviceFee: string;
        }[];
    }>;
    getTechnicianServices(technicianId: number, user: any): Promise<{
        technicianId: number;
        technicianName: string;
        services: {
            duration: number;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            serviceFee: string;
        }[];
    }>;
    getTechniciansForService(serviceId: number, user: any): Promise<{
        serviceId: number;
        serviceName: string;
        technicians: {
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
        }[];
    }>;
    getAllTechniciansWithServices(user: any): Promise<{
        id: number;
        name: string;
        email: string;
        phoneNo: string;
        address: {
            id: number;
            address: string | null;
            township: string;
            city: string;
            district: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        services: {
            duration: number;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            serviceFee: string;
        }[];
    }[]>;
    removeService(technicianId: number, serviceId: number, user: any): Promise<{
        message: string;
    }>;
}
