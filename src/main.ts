import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  });

  // app.setGlobalPrefix('api');
  
  // app.useGlobalPipes(new ValidationPipe({  //Validación global
  //   whitelist: true, //Rechaza campos no definidos en el DTO
  //   forbidNonWhitelisted: true, //Lanza un error si hay campos extra
  //   transform: true //Convierte tipos automáticamente
  // }));


  await app.listen(process.env.PORT ?? 3000);
  console.log(`Servicio corriendo en: http://localhost:${process.env.PORT}`);
}
bootstrap();
