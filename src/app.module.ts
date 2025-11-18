/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { NewsModule } from './news/news.module';
import { DatabaseModule } from './database/database.module';
import { T } from './common/types/common';
// import { InqueryModule } from './inquery/inquery.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_DEV as string),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      formatError: (error: T) => {
        const graphQLFormatedError = {
          code: error?.extensions?.code,
          message:
            error?.extensions?.exception?.response?.message ||
            error?.extensions?.response?.message ||
            error?.message,
        };
        console.log('GRAPHQL GLOBAL ERROR:', graphQLFormatedError);
        return graphQLFormatedError;
      },
    }),
    NewsModule,
    DatabaseModule,
    // InqueryModule,
  ],
})
export class AppModule {}
