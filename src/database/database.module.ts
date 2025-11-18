/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.NODE_ENV === 'production'
            ? process.env.MONGO_PROD
            : process.env.MONGO_DEV,
      }),
    }),
  ],
})
export class DatabaseModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    if (this.connection.readyState === 1) {
      console.log(
        `Success: MongoDB Connected → ${
          process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'
        } DATABASE`,
      );
    } else {
      console.log('Error: MongoDB NOT CONNECTED');
    }
  }
}
