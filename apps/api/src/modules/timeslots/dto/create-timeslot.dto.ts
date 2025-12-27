import { IsInt, IsNotEmpty, IsDateString, IsArray, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTimeslotDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  technicianId!: number;

  @IsDateString()
  @IsNotEmpty()
  date!: string; // ISO date string (YYYY-MM-DD)

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Type(() => Number)
  slots!: number[]; // Array of hours [9, 10, 11, 12, 13, 14, 15, 16]
}



