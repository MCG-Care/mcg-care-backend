import { IsInt, IsNotEmpty, Min, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignServiceDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  technicianId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Type(() => Number)
  serviceIds!: number[]; // Array of service IDs to assign
}








