import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  app.enableCors({
    origin:
      process.env.CLIENT_URL ||
      'http://localhost:3000' ||
      'http://185.209.21.154:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..'), {
    prefix: '/',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
