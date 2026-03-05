import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsNotEmpty()
  serviceFee!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  duration!: number; // in minutes

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  generatesReminder?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  reminderIntervalMonths?: number; // e.g. 6 or 12; used when generatesReminder is true
}



