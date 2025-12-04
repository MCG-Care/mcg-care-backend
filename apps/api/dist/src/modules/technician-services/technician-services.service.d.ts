import { AssignServiceDto } from './dto/assign-service.dto';
export declare class TechnicianServicesService {
    assignServices(assignServiceDto: AssignServiceDto): Promise<{
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
    getTechnicianServices(technicianId: number): Promise<{
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
    getTechniciansForService(serviceId: number): Promise<{
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
    removeService(technicianId: number, serviceId: number): Promise<{
        message: string;
    }>;
    getAllTechniciansWithServices(): Promise<{
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
}
