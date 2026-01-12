import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { SupabaseService } from '../../config/supabase.service';
export declare class ProductsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    create(createProductDto: CreateProductDto, imageFiles: Express.Multer.File[]): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        brand: string;
        productModel: string;
        price: string | null;
        description: string | null;
        capacity: string | null;
        type: "split" | "window" | "cassette" | "portable" | "central";
        energyRating: number | null;
        coolingPower: number | null;
        refrigerant: string | null;
        warranty: number | null;
        tagline: string | null;
        voltageAverage: number | null;
        voltageCount: number | null;
        releaseDate: string | null;
        productImages: {
            [x: string]: any;
        }[];
    }>;
    findAll(query: QueryProductsDto): Promise<{
        data: {
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            productModel: string;
            price: string | null;
            description: string | null;
            capacity: string | null;
            type: "split" | "window" | "cassette" | "portable" | "central";
            energyRating: number | null;
            coolingPower: number | null;
            refrigerant: string | null;
            warranty: number | null;
            tagline: string | null;
            voltageAverage: number | null;
            voltageCount: number | null;
            releaseDate: string | null;
            productImages: {
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        brand: string;
        productModel: string;
        price: string | null;
        description: string | null;
        capacity: string | null;
        type: "split" | "window" | "cassette" | "portable" | "central";
        energyRating: number | null;
        coolingPower: number | null;
        refrigerant: string | null;
        warranty: number | null;
        tagline: string | null;
        voltageAverage: number | null;
        voltageCount: number | null;
        releaseDate: string | null;
        productImages: {
            [x: string]: any;
        }[];
    }>;
    update(id: number, updateProductDto: UpdateProductDto, imageFiles?: Express.Multer.File[]): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        brand: string;
        productModel: string;
        price: string | null;
        description: string | null;
        capacity: string | null;
        type: "split" | "window" | "cassette" | "portable" | "central";
        energyRating: number | null;
        coolingPower: number | null;
        refrigerant: string | null;
        warranty: number | null;
        tagline: string | null;
        voltageAverage: number | null;
        voltageCount: number | null;
        releaseDate: string | null;
        productImages: {
            [x: string]: any;
        }[];
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    removeImage(productId: number, imageId: number): Promise<{
        message: string;
    }>;
    private uploadProductImages;
}
