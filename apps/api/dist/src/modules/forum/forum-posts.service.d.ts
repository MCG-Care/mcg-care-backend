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
            id: any;
            name: any;
            role: any;
        } | {
            id: any;
            name: any;
            role: any;
        }[];
        comments: {
            [x: string]: any;
        }[];
        images: {
            [x: string]: any;
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
                id: any;
                name: any;
                role: any;
            } | {
                id: any;
                name: any;
                role: any;
            }[];
            images: {
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
    findOne(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date | null;
        userId: number;
        title: string;
        content: string;
        likeCount: number;
        user: {
            id: any;
            name: any;
            role: any;
        } | {
            id: any;
            name: any;
            role: any;
        }[];
        comments: {
            [x: string]: any;
        }[];
        images: {
            [x: string]: any;
        }[];
    }>;
    update(id: number, updatePostDto: UpdatePostDto, userId: number, isAdmin?: boolean, imageFiles?: Express.Multer.File[]): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date | null;
        userId: number;
        title: string;
        content: string;
        likeCount: number;
        user: {
            id: any;
            name: any;
            role: any;
        } | {
            id: any;
            name: any;
            role: any;
        }[];
        comments: {
            [x: string]: any;
        }[];
        images: {
            [x: string]: any;
        }[];
    }>;
    remove(id: number, userId: number, isAdmin?: boolean): Promise<{
        message: string;
    }>;
    removeImage(postId: number, imageId: number, userId: number, isAdmin?: boolean): Promise<{
        message: string;
    }>;
    likePost(postId: number, userId: number): Promise<{
        message: string;
        liked: boolean;
        likeCount: number;
    }>;
    hasUserLikedPost(postId: number, userId: number): Promise<boolean>;
    private uploadPostImages;
}
