import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class LikeCommentDto {
  @ApiProperty({
    description: 'User ID (automatically set from JWT token)',
    example: 1,
  })
  @IsInt()
  userId: number;
}
