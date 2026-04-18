import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { SubscriptionController } from './subscription.controller';
import { Subscription } from './subscription.entity';
import { SubscriptionService } from './subscription.service';
import { StripeService } from './stripe.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
	// On expose les repositories Subscription et User dans ce module.
	imports: [TypeOrmModule.forFeature([Subscription, User])],
	// Controller REST du module abonnement.
	controllers: [SubscriptionController],
	// Service métier du module abonnement + service Stripe.
	providers: [SubscriptionService, StripeService, RolesGuard],
	// Export des services pour l'utiliser ensuite dans des guards/modules métiers.
	exports: [SubscriptionService, StripeService],
})
export class SubscriptionModule {}
