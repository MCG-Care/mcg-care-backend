import { Module } from '@nestjs/common';
import { TechnicianServicesService } from './technician-services.service';
import { TechnicianServicesController } from './technician-services.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TechnicianServicesController],
  providers: [TechnicianServicesService],
  exports: [TechnicianServicesService],
})
export class TechnicianServicesModule {}


