import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductType {
  SPLIT = 'split',
  WINDOW = 'window',
  CASSETTE = 'cassette',
  PORTABLE = 'portable',
  CENTRAL = 'central',
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  productModel!: string;

  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  capacity?: number;

  @IsEnum(ProductType)
  @IsNotEmpty()
  type!: ProductType;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  energyRating?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  coolingPower?: number;

  @IsString()
  @IsOptional()
  refrigerant?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  warranty?: number; // in years

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  voltageAverage?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  voltageCount?: number;

  @IsDateString()
  @IsOptional()
  releaseDate?: string;
}

