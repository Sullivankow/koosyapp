import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Charge } from './charge.entity';
import { ChargesService } from './charges.service';
import { ChargesController } from './charges.controller';
import { ProAccessGuard } from '../auth/pro-access.guard';
import { SubscriptionModule } from '../subscriptions/subscription.module';
import { UsersModule } from '../users/users.module';

// Regroupe le contrôleur, le service et l'accès TypeORM des charges.
@Module({
  imports: [TypeOrmModule.forFeature([Charge]), SubscriptionModule, UsersModule],
  providers: [ChargesService, ProAccessGuard],
  controllers: [ChargesController],
})
export class ChargesModule {}
