import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RemoveServiceDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  technicianId!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  serviceId!: number;
}


