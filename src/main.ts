import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './utils/global-exception-filter';
import { CustomValidationPipe } from './utils/ValidationPipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina campos no definidos en el DTO
      forbidNonWhitelisted: true, // Lanza un error si se envían campos no definidos
      transform: true, // Transforma los datos automáticamente
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  // // app.useGlobalFilters(errorsResponse)
  // app.useGlobalPipes(new CustomValidationPipe());

  await app.listen(3001);
}
bootstrap();
