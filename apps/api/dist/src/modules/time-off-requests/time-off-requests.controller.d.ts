import { TimeOffRequestsService } from './time-off-requests.service';
import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';
import { QueryTimeOffRequestsDto } from './dto/query-time-off-requests.dto';
import { ReviewTimeOffRequestDto } from './dto/review-time-off-request.dto';
export declare class TimeOffRequestsController {
    private readonly timeOffRequestsService;
    constructor(timeOffRequestsService: TimeOffRequestsService);
    create(createDto: CreateTimeOffRequestDto, user: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        technicianId: number;
        startDate: string;
        endDate: string;
        startSlot: number;
        endSlot: number;
        isFullDay: boolean;
        reason: string | null;
        status: "pending" | "approved" | "rejected";
        reviewerId: number | null;
        reviewedAt: Date | null;
        reviewNote: string | null;
    }>;
    findAll(query: QueryTimeOffRequestsDto, user: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        technicianId: number;
        startDate: string;
        endDate: string;
        startSlot: number;
        endSlot: number;
        isFullDay: boolean;
        reason: string | null;
        status: "pending" | "approved" | "rejected";
        reviewerId: number | null;
        reviewedAt: Date | null;
        reviewNote: string | null;
        technician: {
            id: any;
            name: any;
            email: any;
            phoneNo: any;
        } | {
            id: any;
            name: any;
            email: any;
            phoneNo: any;
        }[];
        reviewer: {
            id: any;
            name: any;
            email: any;
        } | {
            id: any;
            name: any;
            email: any;
        }[] | null;
    }[]>;
    findOne(id: number, user: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        technicianId: number;
        startDate: string;
        endDate: string;
        startSlot: number;
        endSlot: number;
        isFullDay: boolean;
        reason: string | null;
        status: "pending" | "approved" | "rejected";
        reviewerId: number | null;
        reviewedAt: Date | null;
        reviewNote: string | null;
        technician: {
            id: any;
            name: any;
            email: any;
            phoneNo: any;
        } | {
            id: any;
            name: any;
            email: any;
            phoneNo: any;
        }[];
        reviewer: {
            id: any;
            name: any;
            email: any;
        } | {
            id: any;
            name: any;
            email: any;
        }[] | null;
    }>;
    review(id: number, reviewDto: ReviewTimeOffRequestDto, user: any): Promise<{
        id: number;
        technicianId: number;
        startDate: string;
        endDate: string;
        startSlot: number;
        endSlot: number;
        isFullDay: boolean;
        reason: string | null;
        status: "pending" | "approved" | "rejected";
        reviewerId: number | null;
        reviewedAt: Date | null;
        reviewNote: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
}
