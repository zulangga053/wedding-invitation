import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    credentials: true,
  });

  await app.listen(env.PORT);
  Logger.log(
    `Momentia API listening on http://localhost:${env.PORT}/v1`,
    'Bootstrap',
  );
}

void bootstrap();
