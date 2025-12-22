import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TimeslotsService } from './timeslots.service';

@Injectable()
export class TimeslotsScheduler {
  private readonly logger = new Logger(TimeslotsScheduler.name);

  constructor(private readonly timeslotsService: TimeslotsService) {}

  /**
   * Run daily at midnight (00:00:00)
   * Deletes expired timeslots and adds new ones for day 30
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyTimeslotMaintenance() {
    this.logger.log('Starting daily timeslot maintenance...');

    try {
      const result = await this.timeslotsService.dailyTimeslotMaintenance();
      this.logger.log(
        `Daily maintenance completed: Deleted ${result.deletedCount} expired timeslots, Added ${result.addedCount} new timeslots`,
      );
    } catch (error) {
      this.logger.error('Daily timeslot maintenance failed:', error);
    }
  }
}


