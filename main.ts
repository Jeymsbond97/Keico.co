/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { AppModule } from './src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { LoggingInterceptor } from './src/common/interceptors/logging.interceptor';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({ origin: true, credentials: true });
  app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 }));

  // Serve uploads - use process.cwd() to get project root, not dist folder
  const uploadsPath = join(process.cwd(), 'src', 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });
  console.log(`Static uploads served from: ${uploadsPath}`);

  const adminDistPath = join(__dirname, '..', 'admin', 'dist');
  if (existsSync(adminDistPath)) {
    console.log(`Success: Admin panel at: ${adminDistPath}`);
    // Serve static assets (JS, CSS, images, etc.)
    app.use('/admin', (req, res, next) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const filePath = req.path.replace('/admin', '');

      // Serve static files (assets, etc.)
      if (
        filePath.startsWith('/assets/') ||
        (filePath.includes('.') && filePath !== '/')
      ) {
        const fullPath = join(adminDistPath, filePath);
        return res.sendFile(fullPath, (err) => {
          if (err) {
            console.error(`File not found: ${fullPath}`);
            next();
          }
        });
      }

      return res.sendFile(join(adminDistPath, 'index.html'), (err) => {
        if (err) {
          console.error(
            `Admin index.html not found: ${join(adminDistPath, 'index.html')}`,
          );
          next();
        }
      });
    });
  } else {
    console.log(`Error: Admin panel not at: ${adminDistPath}`);
  }

  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Server: http://localhost:${port}`);
  console.log(`GraphQL: http://localhost:${port}/graphql`);
  if (existsSync(adminDistPath)) {
    console.log(`Admin Panel: http://localhost:${port}/admin`);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
