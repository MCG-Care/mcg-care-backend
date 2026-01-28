import { Module } from '@nestjs/common';
import { TimeOffRequestsService } from './time-off-requests.service';
import { TimeOffRequestsController } from './time-off-requests.controller';

@Module({
  controllers: [TimeOffRequestsController],
  providers: [TimeOffRequestsService],
  exports: [TimeOffRequestsService],
})
export class TimeOffRequestsModule {}
