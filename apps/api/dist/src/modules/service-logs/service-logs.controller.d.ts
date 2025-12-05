import { ServiceLogsService } from './service-logs.service';
import { CreateServiceLogDto } from './dto/create-service-log.dto';
import { UpdateServiceLogDto } from './dto/update-service-log.dto';
export declare class ServiceLogsController {
    private readonly serviceLogsService;
    constructor(serviceLogsService: ServiceLogsService);
    create(createServiceLogDto: CreateServiceLogDto, user: any): Promise<any>;
    findByBookingId(bookingId: number, user: any): Promise<any>;
    findOne(id: number, user: any): Promise<any>;
    update(id: number, updateServiceLogDto: UpdateServiceLogDto, user: any): Promise<any>;
    remove(id: number, user: any): Promise<any>;
}
