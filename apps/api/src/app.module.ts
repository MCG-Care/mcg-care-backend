import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { ForumModule } from './modules/forum/forum.module';
import { CustomerProductsModule } from './modules/customer-products/customer-products.module';
import { ServiceTypesModule } from './modules/service-types/service-types.module';
import { TechnicianServicesModule } from './modules/technician-services/technician-services.module';
import { TimeslotsModule } from './modules/timeslots/timeslots.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ServiceLogsModule } from './modules/service-logs/service-logs.module';
import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { MaintenanceRemindersModule } from './modules/maintenance-reminders/maintenance-reminders.module';
import { TimeOffRequestsModule } from './modules/time-off-requests/time-off-requests.module';
import { DatabaseModule } from './config/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(), // Enable cron jobs
    AuthModule,
    DatabaseModule,
    UsersModule,
    ProductsModule,
    ForumModule,
    CustomerProductsModule,
    ServiceTypesModule,
    TechnicianServicesModule,
    TimeslotsModule,
    BookingsModule,
    ServiceLogsModule,
    FeedbacksModule,
    MaintenanceRemindersModule,
    TimeOffRequestsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
