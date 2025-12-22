import { IsInt, IsString, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFeedbackDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  satisfaction?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  issueResolved?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}


