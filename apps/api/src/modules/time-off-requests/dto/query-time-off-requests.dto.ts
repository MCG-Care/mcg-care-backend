import { IsOptional, IsInt, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTimeOffRequestsDto {
  @ApiPropertyOptional({
    description: 'Filter by technician ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  technicianId?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  })
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';

  @ApiPropertyOptional({
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2026-01-27',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
