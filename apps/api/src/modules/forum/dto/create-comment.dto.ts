import { IsString, IsNotEmpty, MinLength, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  postId!: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Comment cannot be empty' })
  content!: string;

  @IsOptional()
  userId?: number; // TODO: Will be set from auth token when auth is ready
}
