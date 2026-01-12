import { AssignServiceDto } from './dto/assign-service.dto';
export declare class TechnicianServicesService {
    assignServices(assignServiceDto: AssignServiceDto): Promise<{
        technicianId: number;
        technicianName: any;
        services: ({
            [x: string]: any;
        } | {
            [x: string]: any;
        }[])[];
    }>;
    getTechnicianServices(technicianId: number): Promise<{
        technicianId: number;
        technicianName: any;
        services: ({
            [x: string]: any;
        } | {
            [x: string]: any;
        }[])[];
    }>;
    getTechniciansForService(serviceId: number): Promise<{
        serviceId: number;
        serviceName: string;
        technicians: ({
            [x: string]: any;
        } | {
            [x: string]: any;
        }[])[];
    }>;
    removeService(technicianId: number, serviceId: number): Promise<{
        message: string;
    }>;
    getAllTechniciansWithServices(): Promise<{
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        address: any;
        services: any;
    }[]>;
}
