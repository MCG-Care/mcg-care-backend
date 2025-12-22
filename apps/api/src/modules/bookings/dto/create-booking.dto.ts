import {
  IsNotEmpty,
  IsInt,
  IsArray,
  IsString,
  IsOptional,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  airconId: number; // Customer's registered aircon

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Type(() => Number)
  serviceIds: number[]; // Array of service type IDs

  @IsNotEmpty()
  @IsDateString()
  bookingForDate: string; // Date for the service (YYYY-MM-DD)

  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  bookingTime: number; // Start hour (9-16)

  @IsOptional()
  @IsString()
  description?: string; // Optional description from customer
}


