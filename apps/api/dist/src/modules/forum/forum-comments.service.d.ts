import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
export declare class ForumCommentsService {
    create(createCommentDto: CreateCommentDto): Promise<{
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
    update(id: number, updateCommentDto: UpdateCommentDto, userId: number): Promise<{
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
    remove(id: number, userId: number, isAdmin?: boolean): Promise<{
        message: string;
    }>;
    likeComment(commentId: number, userId: number): Promise<{
        message: string;
        liked: boolean;
        likeCount: number;
    }>;
    hasUserLikedComment(commentId: number, userId: number): Promise<boolean>;
}
