import { Module } from '@nestjs/common';
import { TimeslotsService } from './timeslots.service';
import { TimeslotsController } from './timeslots.controller';
import { TimeslotsScheduler } from './timeslots.scheduler';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TimeslotsController],
  providers: [TimeslotsService, TimeslotsScheduler],
  exports: [TimeslotsService],
})
export class TimeslotsModule {}

