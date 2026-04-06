
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  // Important pour Stripe webhooks: créer l'app sans bodyParser, puis le configurer manuellement
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Middleware pour gérer le raw body pour les webhooks Stripe
  app.use(express.json({ verify: (req: any, res, buf) => {
    if (req.url.includes('/subscriptions/webhook')) {
      req.rawBody = buf.toString('utf8');
    }
  }}));
  
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    // Autoriser le front mobile (8081) et le backoffice Vite (5173)
    origin: ['http://localhost:8081', 'http://localhost:5173'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // Exposer le dossier uploads en statique
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const config = new DocumentBuilder()
    .setTitle('Koosy API')
    .setDescription('Documentation de l’API Koosy')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000, '0.0.0.0');
}
bootstrap();

