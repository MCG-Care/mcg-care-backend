import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';
import { QueryTimeOffRequestsDto } from './dto/query-time-off-requests.dto';
import { ReviewTimeOffRequestDto } from './dto/review-time-off-request.dto';
export declare class TimeOffRequestsService {
    private getLocalDateString;
    create(technicianId: number, createDto: CreateTimeOffRequestDto): Promise<{
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
    findAll(query: QueryTimeOffRequestsDto): Promise<{
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
    findOne(id: number): Promise<{
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
    review(id: number, reviewerId: number, reviewDto: ReviewTimeOffRequestDto): Promise<{
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
    private checkForExistingBookings;
    private blockTimeslots;
    remove(id: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
}
