import {
  IsNotEmpty,
  IsDateString,
  IsInt,
  IsBoolean,
  IsString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeOffRequestDto {
  @ApiProperty({
    description: 'Start date of time off (YYYY-MM-DD)',
    example: '2026-01-27',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of time off (YYYY-MM-DD)',
    example: '2026-01-29',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Starting hour slot (9-16)',
    example: 9,
    minimum: 9,
    maximum: 16,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(9)
  @Max(16)
  @Type(() => Number)
  startSlot: number;

  @ApiProperty({
    description: 'Ending hour slot (9-16)',
    example: 16,
    minimum: 9,
    maximum: 16,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(9)
  @Max(16)
  @Type(() => Number)
  endSlot: number;

  @ApiProperty({
    description: 'Whether this is a full day request (9am-4pm)',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  isFullDay: boolean;

  @ApiPropertyOptional({
    description: 'Reason for time off request',
    example: 'Personal appointment',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
