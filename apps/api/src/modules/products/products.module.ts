import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SupabaseService } from '../../config/supabase.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, SupabaseService],
  exports: [ProductsService],
})
export class ProductsModule {}

