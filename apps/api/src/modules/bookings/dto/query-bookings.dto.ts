import { IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryBookingsDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  customerId?: number; // Filter by customer

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  technicianId?: number; // Filter by technician

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  airconId?: number; // Filter by aircon

  @IsOptional()
  @IsEnum(['pending', 'inprogress', 'done', 'unsuccessful'])
  status?: 'pending' | 'inprogress' | 'done' | 'unsuccessful';

  @IsOptional()
  @IsDateString()
  bookingForDate?: string; // Filter by booking date
}






