import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { SupabaseService } from '../../config/supabase.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, SupabaseService],
  exports: [BookingsService],
})
export class BookingsModule {}







