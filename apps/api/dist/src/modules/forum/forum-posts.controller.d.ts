import { ForumPostsService } from './forum-posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
export declare class ForumPostsController {
    private readonly forumPostsService;
    constructor(forumPostsService: ForumPostsService);
    create(createPostDto: CreatePostDto, files?: Express.Multer.File[], user?: any): Promise<{
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
    update(id: number, updatePostDto: UpdatePostDto, files?: Express.Multer.File[], user?: any): Promise<{
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
    remove(id: number, user?: any): Promise<{
        message: string;
    }>;
    removeImage(postId: number, imageId: number, user?: any): Promise<{
        message: string;
    }>;
    likePost(id: number, user?: any): Promise<{
        message: string;
        liked: boolean;
        likeCount: number;
    }>;
    hasLikedPost(id: number, user?: any): Promise<{
        postId: number;
        userId: any;
        hasLiked: boolean;
    }>;
}
