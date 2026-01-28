import {
  Controller,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MaintenanceRemindersService } from './maintenance-reminders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('maintenance-reminders')
@ApiBearerAuth('JWT-auth')
@Controller('maintenance-reminders')
@UseGuards(JwtAuthGuard)
export class MaintenanceRemindersController {
  constructor(
    private readonly maintenanceRemindersService: MaintenanceRemindersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get active maintenance reminders (Customer only)',
    description:
      'Returns all active reminders for the logged-in customer within the next month from today. ' +
      'Each reminder includes the aircon details, service type, and associated promotion code.',
  })
  async getActiveReminders(@CurrentUser() user: any) {
    // Only customers can check their reminders
    if (user.role !== 'customer') {
      throw new BadRequestException('Only customers can view reminders');
    }

    return this.maintenanceRemindersService.getActiveReminders(user.id);
  }
}
