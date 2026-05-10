import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Sécurité HTTP
  app.use(helmet());

  // Raw body pour Stripe
  app.use(express.json({ verify: (req: any, res, buf) => {
    if (req.url.includes('/subscriptions/webhook')) {
      req.rawBody = buf.toString('utf8');
    }
  }}));

  // Validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    disableErrorMessages: process.env.NODE_ENV === 'production',
  }));

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081', 'http://localhost:5173'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // Versioning
  // app.enableVersioning({
  //   type: VersioningType.URI,
  //   defaultVersion: '1',
  // });

  // Fichiers statiques
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Graceful shutdown
  app.enableShutdownHooks();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Koosy API')
    .setDescription(`Documentation de l'API Koosy`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();

