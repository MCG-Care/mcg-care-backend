import { Module } from '@nestjs/common';
import { CustomerProductsService } from './customer-products.service';
import { CustomerProductsController } from './customer-products.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CustomerProductsController],
  providers: [CustomerProductsService],
  exports: [CustomerProductsService],
})
export class CustomerProductsModule {}




