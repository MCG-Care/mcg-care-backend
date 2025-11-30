import { ForumCommentsService } from './forum-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
export declare class ForumCommentsController {
    private readonly forumCommentsService;
    constructor(forumCommentsService: ForumCommentsService);
    create(createCommentDto: CreateCommentDto, user?: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        content: string;
        likeCount: number;
        postId: number;
        user: {
            id: number;
            name: string;
            role: "customer" | "technician" | "admin";
        };
        post: {
            id: number;
            title: string;
        };
    }>;
    findAll(query: QueryCommentsDto): Promise<{
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            content: string;
            likeCount: number;
            postId: number;
            user: {
                id: number;
                name: string;
                role: "customer" | "technician" | "admin";
            };
            post: {
                id: number;
                title: string;
            };
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        content: string;
        likeCount: number;
        postId: number;
        user: {
            id: number;
            name: string;
            role: "customer" | "technician" | "admin";
        };
        post: {
            id: number;
            title: string;
        };
    }>;
    update(id: number, updateCommentDto: UpdateCommentDto, user?: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        content: string;
        likeCount: number;
        postId: number;
        user: {
            id: number;
            name: string;
            role: "customer" | "technician" | "admin";
        };
        post: {
            id: number;
            title: string;
        };
    }>;
    remove(id: number, user?: any): Promise<{
        message: string;
    }>;
}
