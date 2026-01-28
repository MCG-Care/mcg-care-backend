import { MaintenanceRemindersService } from './maintenance-reminders.service';
export declare class MaintenanceRemindersController {
    private readonly maintenanceRemindersService;
    constructor(maintenanceRemindersService: MaintenanceRemindersService);
    getActiveReminders(user: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        customerId: number;
        customerProductId: number;
        serviceTypeId: number;
        promotionCodeId: number;
        reminderDate: string;
        customerProduct: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        serviceType: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        promotionCode: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }[]>;
}
