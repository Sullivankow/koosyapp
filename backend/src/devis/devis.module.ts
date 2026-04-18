import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Devis } from './devis.entity';
import { DevisService } from './devis.service';
import { DevisController } from './devis.controller';
import { UsersModule } from '../users/users.module';
import { SubscriptionModule } from '../subscriptions/subscription.module';
import { ProAccessGuard } from '../auth/pro-access.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Devis]), UsersModule, SubscriptionModule],
  providers: [DevisService, ProAccessGuard, RolesGuard],
  controllers: [DevisController],
  exports: [DevisService],
})
export class DevisModule {}
