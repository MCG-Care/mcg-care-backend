import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookingDto {
  @IsOptional()
  @IsEnum(['pending', 'inprogress', 'done', 'unsuccessful'])
  status?: 'pending' | 'inprogress' | 'done' | 'unsuccessful';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  fees?: number; // Technician can add extra fees
}
