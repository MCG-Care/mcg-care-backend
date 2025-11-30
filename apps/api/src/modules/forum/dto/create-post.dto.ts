import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  content!: string;

  @IsOptional()
  userId?: number; // TODO: Will be set from auth token when auth is ready
}

