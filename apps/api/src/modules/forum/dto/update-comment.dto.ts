import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Comment cannot be empty' })
  content?: string;
}

