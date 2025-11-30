import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { DatabaseModule, DB_PROVIDER } from '../../config/database.module';
import { db } from '../../config/database';

@Module({
  imports: [DatabaseModule],
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
