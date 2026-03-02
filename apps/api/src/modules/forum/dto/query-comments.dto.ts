import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCommentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  postId?: number; // Filter by post

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number; // Filter by user who created the comment

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 30;
}
