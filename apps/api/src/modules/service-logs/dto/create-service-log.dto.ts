import { IsNotEmpty, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceLogDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  bookingId: number;

  @IsNotEmpty()
  @IsString()
  note: string;
}

