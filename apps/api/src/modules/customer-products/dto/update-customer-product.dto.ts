import { IsString, IsOptional } from 'class-validator';

export class UpdateCustomerProductDto {
  @IsString()
  @IsOptional()
  name?: string; // nickname

  @IsString()
  @IsOptional()
  purchaseCode?: string; // can only be added if not already set
}
