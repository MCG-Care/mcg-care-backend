import { TechnicianServicesService } from './technician-services.service';
import { AssignServiceDto } from './dto/assign-service.dto';
export declare class TechnicianServicesController {
    private readonly technicianServicesService;
    constructor(technicianServicesService: TechnicianServicesService);
    assignServices(assignServiceDto: AssignServiceDto, user: any): Promise<{
        technicianId: number;
        technicianName: any;
        services: ({
            [x: string]: any;
        } | {
            [x: string]: any;
        }[])[];
    }>;
    getTechnicianServices(technicianId: number, user: any): Promise<{
        technicianId: number;
        technicianName: any;
        services: ({
            [x: string]: any;
        } | {
            [x: string]: any;
        }[])[];
    }>;
    getTechniciansForService(serviceId: number, user: any): Promise<{
        serviceId: number;
        serviceName: string;
        technicians: ({
            [x: string]: any;
        } | {
            [x: string]: any;
        }[])[];
    }>;
    getAllTechniciansWithServices(user: any): Promise<{
        id: any;
        name: any;
        email: any;
        phoneNo: any;
        address: any;
        services: any;
    }[]>;
    removeService(technicianId: number, serviceId: number, user: any): Promise<{
        message: string;
    }>;
}
