import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerProductDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  productId!: number;

  @IsString()
  @IsNotEmpty()
  name!: string; // nickname like "bedroom aircon"

  @IsString()
  @IsOptional()
  purchaseCode?: string; // unique code from receipt (optional)
}


