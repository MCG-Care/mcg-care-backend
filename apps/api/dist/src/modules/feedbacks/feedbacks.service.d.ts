import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { QueryFeedbacksDto } from './dto/query-feedbacks.dto';
import { UsersService } from '../users/user.service';
export declare class FeedbacksService {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(userId: number, userRole: string, createFeedbackDto: CreateFeedbackDto): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string | null;
        rating: number;
        satisfaction: number | null;
        issueResolved: boolean | null;
        booking: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    findAll(userId: number, userRole: string, query: QueryFeedbacksDto): Promise<{
        data: {
            id: number;
            createdAt: Date;
            bookingId: number;
            note: string | null;
            rating: number;
            satisfaction: number | null;
            issueResolved: boolean | null;
            booking: {
                [x: string]: any;
            } | {
                [x: string]: any;
            }[];
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
        technicianId?: number;
        averageRating?: number;
        averageRatingRounded?: number;
        totalFeedbacks?: number;
    }>;
    findByBookingId(bookingId: number, userId: number, userRole: string): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string | null;
        rating: number;
        satisfaction: number | null;
        issueResolved: boolean | null;
        booking: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    findOne(id: number, userId: number, userRole: string): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string | null;
        rating: number;
        satisfaction: number | null;
        issueResolved: boolean | null;
        booking: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    update(id: number, userId: number, userRole: string, updateFeedbackDto: UpdateFeedbackDto): Promise<{
        id: number;
        createdAt: Date;
        bookingId: number;
        note: string | null;
        rating: number;
        satisfaction: number | null;
        issueResolved: boolean | null;
        booking: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    remove(id: number, userId: number, userRole: string): Promise<{
        message: string;
    }>;
}
