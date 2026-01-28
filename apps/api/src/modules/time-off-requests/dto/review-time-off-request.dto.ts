import { IsNotEmpty, IsIn, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewTimeOffRequestDto {
  @ApiProperty({
    description: 'Review decision',
    example: 'approved',
    enum: ['approved', 'rejected'],
  })
  @IsNotEmpty()
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ApiPropertyOptional({
    description: 'Optional note from admin',
    example: 'Approved for personal leave',
  })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
