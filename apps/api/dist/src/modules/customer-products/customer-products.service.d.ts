import { CreateCustomerProductDto } from './dto/create-customer-product.dto';
import { UpdateCustomerProductDto } from './dto/update-customer-product.dto';
import { QueryCustomerProductsDto } from './dto/query-customer-products.dto';
export declare class CustomerProductsService {
    private generateQRPayload;
    create(customerId: number, createCustomerProductDto: CreateCustomerProductDto): Promise<{
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
    findAll(customerId: number | undefined, query: QueryCustomerProductsDto): Promise<{
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
    findOne(id: number, customerId?: number, isAdmin?: boolean): Promise<{
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
    findByQR(qrUrl: string): Promise<{
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
    update(id: number, customerId: number, updateCustomerProductDto: UpdateCustomerProductDto): Promise<{
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
    remove(id: number, customerId: number): Promise<{
        message: string;
    }>;
}
