import { LigneFactureModule } from './ligne-facture/ligne-facture.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BiensModule } from './biens/biens.module';
import { ReservationsModule } from './reservations/reservations.module';
import { TachesModule } from './taches/taches.module';
import { BienImageModule } from './Image/bien-image/bien-image.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PrestationsModule } from './prestations/prestation.module';
import { join } from 'path';
import { EntrepriseModule } from './entreprise/entreprise.module';
import { DevisModule } from './devis/devis.module';
import { FactureModule } from './facture/facture.module';
import { LigneDevisModule } from './ligne-devis/ligne-devis.module';
import { ProprietaireModule } from './proprietaire/proprietaire.module';
import { SubscriptionModule } from './subscriptions/subscription.module';
import { ChargesModule } from './charges/charges.module';

@Module({
  imports: [
      ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      // IMPORTANT: Désactiver 'synchronize' en production pour éviter
      // toute modification automatique du schéma qui pourrait supprimer
      // ou altérer des données. Utiliser les migrations TypeORM pour
      // appliquer les changements de schéma de façon contrôlée.
      synchronize: false,
    }),
  ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    BiensModule,
    ReservationsModule,
    TachesModule,
    BienImageModule,
    PrestationsModule,
    EntrepriseModule,
    DevisModule,
    FactureModule,
    LigneFactureModule,
    LigneDevisModule,
    ProprietaireModule,
    SubscriptionModule,
    // Le module charges ajoute les routes de dépenses à l'API.
    ChargesModule,
    




  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})



export class AppModule { }



