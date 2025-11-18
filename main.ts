import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { AppModule } from './src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { LoggingInterceptor } from './src/common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({ origin: true, credentials: true });
  app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 }));
  app.useStaticAssets(join(__dirname, 'src', 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server: http://localhost:${port}`);
  console.log(`📊 GraphQL: http://localhost:${port}/graphql`);
}

bootstrap().catch((error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
