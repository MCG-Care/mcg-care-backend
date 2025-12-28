import { IsNotEmpty, IsInt, IsString, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFeedbackDto {
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  bookingId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number; // 1-5 stars

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  satisfaction?: number; // 1-5 scale

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  issueResolved?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

