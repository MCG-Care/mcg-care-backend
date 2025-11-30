export declare enum ProductType {
    SPLIT = "split",
    WINDOW = "window",
    CASSETTE = "cassette",
    PORTABLE = "portable",
    CENTRAL = "central"
}
export declare class CreateProductDto {
    name: string;
    productModel: string;
    brand: string;
    price?: number;
    description?: string;
    capacity?: number;
    type: ProductType;
    energyRating?: number;
    coolingPower?: number;
    refrigerant?: string;
    warranty?: number;
    tagline?: string;
    voltageAverage?: number;
    voltageCount?: number;
    releaseDate?: string;
}
