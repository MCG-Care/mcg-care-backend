import { IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTimeslotsDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  technicianId?: number;

  @IsDateString()
  @IsOptional()
  date?: string; // ISO date string (YYYY-MM-DD)

  @IsDateString()
  @IsOptional()
  startDate?: string; // For date range queries

  @IsDateString()
  @IsOptional()
  endDate?: string; // For date range queries
}




