import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
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
    summary: 'Get promotion code by ID',
    description:
      'Returns promo code details for the given ID. Accessible by the related customer, assigned technicians, and admins.',
  })
  @ApiParam({ name: 'id', description: 'Promotion code ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.promotionCodesService.findOne(id, user.id, user.role);
  }
}
