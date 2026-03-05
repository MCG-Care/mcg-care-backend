import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCustomerProductsDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 30;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  customerId?: number; // For admin: filter by specific customer

  @IsString()
  @IsOptional()
  search?: string; // Search by serial number (last part of qrUrl), customer name, or email
}
