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
            password: string;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phoneNo: string;
            addressId: number | null;
            role: "customer" | "technician" | "admin";
            address: {
                id: number;
                address: string | null;
                township: string;
                city: string;
                district: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
        product: {
            id: number;
            brand: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
                url: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
            }[];
        };
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
                password: string;
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                phoneNo: string;
                addressId: number | null;
                role: "customer" | "technician" | "admin";
                address: {
                    id: number;
                    address: string | null;
                    township: string;
                    city: string;
                    district: string;
                    createdAt: Date;
                    updatedAt: Date;
                } | null;
            };
            product: {
                id: number;
                brand: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
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
                    url: string;
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    productId: number;
                }[];
            };
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
            password: string;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phoneNo: string;
            addressId: number | null;
            role: "customer" | "technician" | "admin";
            address: {
                id: number;
                address: string | null;
                township: string;
                city: string;
                district: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
        bookings: {
            duration: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            technicianId: number;
            airconId: number;
            bookingOnDate: string;
            bookingForDate: string;
            bookingTime: string;
            fees: string;
            status: "pending" | "inprogress" | "done" | "unsuccessful";
            bookingServices: {
                createdAt: Date;
                serviceId: number;
                bookingId: number;
                service: {
                    duration: number;
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    serviceFee: string;
                };
            }[];
            serviceLog: {
                id: number;
                createdAt: Date;
                bookingId: number;
                note: string;
            } | null;
            feedback: {
                id: number;
                createdAt: Date;
                bookingId: number;
                note: string | null;
                rating: number;
                satisfaction: number | null;
                issueResolved: boolean | null;
            } | null;
        }[];
        product: {
            id: number;
            brand: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
                url: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
            }[];
        };
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
            password: string;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phoneNo: string;
            addressId: number | null;
            role: "customer" | "technician" | "admin";
            address: {
                id: number;
                address: string | null;
                township: string;
                city: string;
                district: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
        product: {
            id: number;
            brand: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
                url: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
            }[];
        };
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
            password: string;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            phoneNo: string;
            addressId: number | null;
            role: "customer" | "technician" | "admin";
            address: {
                id: number;
                address: string | null;
                township: string;
                city: string;
                district: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        };
        product: {
            id: number;
            brand: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
                url: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                productId: number;
            }[];
        };
    }>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
}
