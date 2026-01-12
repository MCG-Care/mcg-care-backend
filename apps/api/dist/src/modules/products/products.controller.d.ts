import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, files: Express.Multer.File[], user?: any): Promise<{
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
    update(id: number, updateProductDto: UpdateProductDto, files?: Express.Multer.File[], user?: any): Promise<{
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
    remove(id: number, user?: any): Promise<{
        message: string;
    }>;
    removeImage(productId: number, imageId: number, user?: any): Promise<{
        message: string;
    }>;
}
