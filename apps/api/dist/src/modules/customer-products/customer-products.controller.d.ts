import { CustomerProductsService } from './customer-products.service';
import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';
import { QueryCustomerProductsDto } from './dto/query-customer-products.dto';
export declare class CustomerProductsController {
    private readonly customerProductsService;
    constructor(customerProductsService: CustomerProductsService);
    create(createCustomerProductDto: CreateCustomerProductDto, user: any): Promise<{
        warrantyEndDate: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        customerId: number;
        purchaseDate: string | null;
        qrUrl: string | null;
        purchaseCode: string | null;
        customer: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        product: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    findAll(query: QueryCustomerProductsDto, user: any): Promise<{
        data: {
            warrantyEndDate: string | null;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            productId: number;
            customerId: number;
            purchaseDate: string | null;
            qrUrl: string | null;
            purchaseCode: string | null;
            customer: {
                [x: string]: any;
            } | {
                [x: string]: any;
            }[];
            product: {
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
    findByQR(qrUrl: string, user: any): Promise<{
        warrantyEndDate: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        customerId: number;
        purchaseDate: string | null;
        qrUrl: string | null;
        purchaseCode: string | null;
        customer: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        bookings: {
            [x: string]: any;
        }[];
        product: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    findOne(id: number, user: any): Promise<{
        warrantyEndDate: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        customerId: number;
        purchaseDate: string | null;
        qrUrl: string | null;
        purchaseCode: string | null;
        customer: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        product: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    update(id: number, updateCustomerProductDto: UpdateCustomerProductDto, user: any): Promise<{
        warrantyEndDate: string | null;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        customerId: number;
        purchaseDate: string | null;
        qrUrl: string | null;
        purchaseCode: string | null;
        customer: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
        product: {
            [x: string]: any;
        } | {
            [x: string]: any;
        }[];
    }>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
}
