import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './subscription.entity';
import { SubscriptionService } from './subscription.service';

@Module({
	// On expose les repositories Subscription et User dans ce module.
	imports: [TypeOrmModule.forFeature([Subscription, User])],
	// Controller REST du module abonnement.
	controllers: [SubscriptionController],
	// Service métier du module abonnement.
	providers: [SubscriptionService],
	// Export du service pour l'utiliser ensuite dans des guards/modules métiers.
	exports: [SubscriptionService],
})
export class SubscriptionModule {}
