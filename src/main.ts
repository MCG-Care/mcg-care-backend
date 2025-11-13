import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe for DTOs (optional for now)
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
  console.log(`🚀 Application running on: http://localhost:3000`);
}
bootstrap();
