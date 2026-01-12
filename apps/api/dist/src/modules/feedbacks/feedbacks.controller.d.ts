import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { QueryFeedbacksDto } from './dto/query-feedbacks.dto';
export declare class FeedbacksController {
    private readonly feedbacksService;
    constructor(feedbacksService: FeedbacksService);
    create(createFeedbackDto: CreateFeedbackDto, user: any): Promise<{
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
    findAll(query: QueryFeedbacksDto, user: any): Promise<{
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
    }>;
    findByBookingId(bookingId: number, user: any): Promise<{
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
    findOne(id: number, user: any): Promise<{
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
    update(id: number, updateFeedbackDto: UpdateFeedbackDto, user: any): Promise<{
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
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
}
