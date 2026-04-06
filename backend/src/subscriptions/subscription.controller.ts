import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
	constructor(private readonly subscriptionService: SubscriptionService) {}

	// Endpoint pour consulter son abonnement actuel.
	@Get('me')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Récupérer mon abonnement' })
	async getMySubscription(@Request() req) {
		// Le JwtStrategy place userId dans req.user.
		const userId = Number(req.user?.userId);
		return this.subscriptionService.getMySubscription(userId);
	}

	// Endpoint qui prépare la future session Stripe Checkout.
	@Post('prepare-checkout')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Préparer un checkout Stripe (sans appeler Stripe pour le moment)' })
	async prepareCheckout(@Request() req, @Body() dto: CreateSubscriptionDto) {
		const userId = Number(req.user?.userId);
		return this.subscriptionService.prepareCheckout(userId, dto);
	}

	// Endpoint de simulation webhook pour avancer sans compte Stripe.
	@Post('simulate-webhook')
	@ApiOperation({ summary: 'Simuler un webhook Stripe (mode développement)' })
	async simulateWebhook(
		@Body()
		body: {
			userId: number;
			stripeCustomerId?: string;
			stripeSubscriptionId?: string;
			status?: 'incomplete' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
			currentPeriodStart?: string;
			currentPeriodEnd?: string;
			trialEnd?: string;
			cancelAtPeriodEnd?: boolean;
			canceledAt?: string;
			metadata?: Record<string, any>;
		},
	) {
		return this.subscriptionService.upsertFromStripeEvent({
			userId: Number(body.userId),
			stripeCustomerId: body.stripeCustomerId,
			stripeSubscriptionId: body.stripeSubscriptionId,
			status: body.status,
			currentPeriodStart: body.currentPeriodStart ? new Date(body.currentPeriodStart) : undefined,
			currentPeriodEnd: body.currentPeriodEnd ? new Date(body.currentPeriodEnd) : undefined,
			trialEnd: body.trialEnd ? new Date(body.trialEnd) : undefined,
			cancelAtPeriodEnd: body.cancelAtPeriodEnd,
			canceledAt: body.canceledAt ? new Date(body.canceledAt) : undefined,
			metadata: body.metadata,
		});
	}
}
