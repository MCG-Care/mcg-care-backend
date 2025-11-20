import { Global, Module } from '@nestjs/common';
import { db } from './database';

const DB_PROVIDER = 'DRIZZLE_DB';

@Global()
@Module({
  providers: [
    {
      provide: DB_PROVIDER,
      useValue: db,
    },
  ],
  exports: [DB_PROVIDER],
})
export class DatabaseModule {}

export { DB_PROVIDER };

