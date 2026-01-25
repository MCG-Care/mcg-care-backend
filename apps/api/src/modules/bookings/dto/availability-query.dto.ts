import {
  IsNotEmpty,
  IsInt,
  IsArray,
  IsOptional,
  ArrayMinSize,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class AvailabilityQueryDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  airconId: number; // Customer's registered aircon

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Transform(({ value }) => {
    // Handle different formats:
    // 1. Array from query params: ["1", "2"] or [1, 2]
    // 2. Comma-separated string: "1,2"
    // 3. Single value: "1" or 1
    
    if (Array.isArray(value)) {
      return value.map((id) => {
        const num = typeof id === 'string' ? parseInt(id.trim(), 10) : Number(id);
        return isNaN(num) ? null : num;
      }).filter((id) => id !== null);
    }
    
    if (typeof value === 'string') {
      // Handle comma-separated string
      if (value.includes(',')) {
        return value.split(',').map((id: string) => {
          const num = parseInt(id.trim(), 10);
          return isNaN(num) ? null : num;
        }).filter((id) => id !== null);
      }
      // Handle single string value
      const num = parseInt(value.trim(), 10);
      return isNaN(num) ? [] : [num];
    }
    
    // Handle single number
    const num = Number(value);
    return isNaN(num) ? [] : [num];
  })
  @Type(() => Number)
  serviceIds: number[]; // Array of service type IDs

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  addressId?: number; // Optional address ID - if provided, uses this address's district; otherwise uses primary address district

  @IsOptional()
  @IsDateString()
  date?: string; // Optional date (YYYY-MM-DD) - if provided, returns availability only for this date; otherwise returns 30 days
}
