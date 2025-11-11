import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { AppModule } from './src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
// import { HttpExceptionFilter } from './src/common/filters/http-exception.filter.ts';
// import { LoggingInterceptor } from './src/common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  //   app.useGlobalFilters(new HttpExceptionFilter());
  //   app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({ origin: true, credentials: true });
  app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 }));
  app.useStaticAssets(join(__dirname, 'src', 'uploads'), {
    prefix: '/uploads',
  });
  await app.listen(process.env.PORT || 3012);
}
bootstrap();
