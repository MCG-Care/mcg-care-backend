import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { DatabaseModule, DB_PROVIDER } from '../../config/database.module';
import { db } from '../../config/database';
import { AuthModule } from '../auth/auth.module';
import { TimeslotsModule } from '../timeslots/timeslots.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule),
    forwardRef(() => TimeslotsModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: DB_PROVIDER,
      useValue: db,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
