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
            id: any;
            name: any;
            role: any;
        } | {
            id: any;
            name: any;
            role: any;
        }[];
        post: {
            id: any;
            title: any;
        } | {
            id: any;
            title: any;
        }[];
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
                id: any;
                name: any;
                role: any;
            } | {
                id: any;
                name: any;
                role: any;
            }[];
            post: {
                id: any;
                title: any;
            } | {
                id: any;
                title: any;
            }[];
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
            id: any;
            name: any;
            role: any;
        } | {
            id: any;
            name: any;
            role: any;
        }[];
        post: {
            id: any;
            title: any;
        } | {
            id: any;
            title: any;
        }[];
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
            id: any;
            name: any;
            role: any;
        } | {
            id: any;
            name: any;
            role: any;
        }[];
        post: {
            id: any;
            title: any;
        } | {
            id: any;
            title: any;
        }[];
    }>;
    remove(id: number, user?: any): Promise<{
        message: string;
    }>;
    likeComment(id: number, user?: any): Promise<{
        message: string;
        liked: boolean;
        likeCount: number;
    }>;
    hasLikedComment(id: number, user?: any): Promise<{
        commentId: number;
        userId: any;
        hasLiked: boolean;
    }>;
}
