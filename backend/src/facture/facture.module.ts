import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Facture } from './facture.entity';
import { FactureService } from './facture.service';
import { FactureController } from './facture.controller';
import { UsersModule } from '../users/users.module';
import { SubscriptionModule } from '../subscriptions/subscription.module';
import { ProAccessGuard } from '../auth/pro-access.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Facture]), UsersModule, SubscriptionModule],
  providers: [FactureService, ProAccessGuard],
  controllers: [FactureController],
  exports: [FactureService],
})
export class FactureModule {}
