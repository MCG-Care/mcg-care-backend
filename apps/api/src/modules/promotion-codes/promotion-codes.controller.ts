import {
  Controller,
  Get,
  UseGuards,
  BadRequestException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PromotionCodesService } from './promotion-codes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('promotion-codes')
@ApiBearerAuth('JWT-auth')
@Controller('promotion-codes')
@UseGuards(JwtAuthGuard)
export class PromotionCodesController {
  constructor(
    private readonly promotionCodesService: PromotionCodesService,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get promotion code by ID (Customer only)',
    description:
      'Returns promo code details for the given ID. Same structure as promotion codes included in maintenance-reminders. ' +
      'Only customers can view their own promotion codes.',
  })
  @ApiParam({ name: 'id', description: 'Promotion code ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    if (user.role !== 'customer') {
      throw new BadRequestException('Only customers can view promotion codes');
    }

    return this.promotionCodesService.findOne(id, user.id);
  }
}
