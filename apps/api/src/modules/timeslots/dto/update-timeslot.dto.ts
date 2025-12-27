import { IsArray, IsInt, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTimeslotDto {
  @IsArray()
  @ArrayMinSize(0) // Allow empty array (no slots available)
  @IsInt({ each: true })
  @Type(() => Number)
  slots!: number[]; // Array of hours [9, 10, 11, 12, 13, 14, 15, 16]
}



