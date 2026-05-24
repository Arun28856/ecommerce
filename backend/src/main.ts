import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({ origin: 'http://localhost:3000' });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log('✅ Connected to MongoDB');
  console.log(`✅ Nest application successfully started on port ${port}`);
}
bootstrap();
        