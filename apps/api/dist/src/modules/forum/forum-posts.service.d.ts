import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { SupabaseService } from '../../config/supabase.service';
export declare class ForumPostsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createPostDto: CreatePostDto, imageFiles?: Express.Multer.File[]): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date | null;
        userId: number;
        title: string;
        content: string;
        likeCount: number;
        user: {
            id: number;
            name: string;
            role: "customer" | "technician" | "admin";
        };
        comments: {
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
        }[];
        images: {
            url: string;
            id: number;
            createdAt: Date;
            postId: number;
        }[];
    }>;
    findAll(query: QueryPostsDto): Promise<{
        data: {
            commentCount: number;
            comments: undefined;
            id: number;
            createdAt: Date;
            updatedAt: Date | null;
            userId: number;
            title: string;
            content: string;
            likeCount: number;
            user: {
                id: number;
                name: string;
                role: "customer" | "technician" | "admin";
            };
            images: {
                url: string;
                id: number;
                createdAt: Date;
                postId: number;
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
        updatedAt: Date | null;
        userId: number;
        title: string;
        content: string;
        likeCount: number;
        user: {
            id: number;
            name: string;
            role: "customer" | "technician" | "admin";
        };
        comments: {
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
        }[];
        images: {
            url: string;
            id: number;
            createdAt: Date;
            postId: number;
        }[];
    }>;
    update(id: number, updatePostDto: UpdatePostDto, userId: number, imageFiles?: Express.Multer.File[]): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date | null;
        userId: number;
        title: string;
        content: string;
        likeCount: number;
        user: {
            id: number;
            name: string;
            role: "customer" | "technician" | "admin";
        };
        comments: {
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
        }[];
        images: {
            url: string;
            id: number;
            createdAt: Date;
            postId: number;
        }[];
    }>;
    remove(id: number, userId: number, isAdmin?: boolean): Promise<{
        message: string;
    }>;
    removeImage(postId: number, imageId: number, userId: number, isAdmin?: boolean): Promise<{
        message: string;
    }>;
    private uploadPostImages;
}
