import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim().replace(/\/+$/, ''))
    : ['http://localhost:3000'];
  app.enableCors({ origin: allowedOrigins });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log('✅ Connected to MongoDB');
  console.log(`✅ Nest application successfully started on port ${port}`);
  console.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
        