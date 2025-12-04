import { TimeslotsService } from './timeslots.service';
export declare class TimeslotsScheduler {
    private readonly timeslotsService;
    private readonly logger;
    constructor(timeslotsService: TimeslotsService);
    handleDailyTimeslotMaintenance(): Promise<void>;
}
