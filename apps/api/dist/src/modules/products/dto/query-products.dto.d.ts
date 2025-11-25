import { ProductType } from './create-product.dto';
export declare class QueryProductsDto {
    search?: string;
    type?: ProductType;
    brand?: string;
    page?: number;
    limit?: number;
}
