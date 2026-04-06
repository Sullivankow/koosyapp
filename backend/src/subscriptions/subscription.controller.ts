import { Body, Controller, Get, Post, Request, UseGuards, BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { CancelSubscriptionDto } from './cancel-subscription.dto';
import { SubscriptionService } from './subscription.service';
import { StripeService } from './stripe.service';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly stripeService: StripeService,
	) {}

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
	@ApiOperation({ summary: 'Préparer un checkout Stripe (pré-enregistrement local)' })
	async prepareCheckout(@Request() req, @Body() dto: CreateSubscriptionDto) {
		const userId = Number(req.user?.userId);
		return this.subscriptionService.prepareCheckout(userId, dto);
	}

	// Endpoint pour créer la session Stripe Checkout.
	@Post('checkout')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Créer une session Stripe Checkout' })
	async createCheckout(@Request() req, @Body() dto: CreateSubscriptionDto) {
		const userId = Number(req.user?.userId);

		// Récupérer l'abonnement existant (s'il existe)
		const subscription = await this.subscriptionService.getMySubscription(userId);
		const customerId = subscription?.stripeCustomerId || null;

		// Créer la session Stripe
		const checkoutUrl = await this.stripeService.createCheckoutSession(
			customerId,
			dto.priceId,
			dto.successUrl,
			dto.cancelUrl,
			dto.trialDays,
			userId,
		);

		// Mettre à jour localement avec le statut "incomplete" en attendant webhook
		await this.subscriptionService.upsertFromStripeEvent({
			userId,
			metadata: {
				lastCheckoutAt: new Date().toISOString(),
				priceId: dto.priceId,
			},
		});

		return {
			message: 'Session checkout créée',
			checkoutUrl,
			userId,
		};
	}

	private async syncFromStripeSubscription(subscriptionId: string) {
		const stripeSubscription = await this.stripeService.getSubscription(subscriptionId);
		const data = this.stripeService.handleSubscriptionUpdated(stripeSubscription);
		const payload: any = {
			...data,
			stripeCustomerId: stripeSubscription.customer as string,
			stripeSubscriptionId: stripeSubscription.id,
			stripePriceId:
				(stripeSubscription.items?.data?.[0]?.price?.id as string) ||
				(stripeSubscription.metadata?.priceId as string),
		};
		return this.subscriptionService.upsertFromStripeEvent(payload);
	}

	// Endpoint pour annuler l'abonnement de l'utilisateur.
	@Post('cancel')
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@ApiBody({ type: CancelSubscriptionDto })
	@ApiOperation({ summary: 'Annuler mon abonnement' })
	async cancelSubscription(
		@Request() req,
		@Body() body: CancelSubscriptionDto = {},
	) {
		const userId = Number(req.user?.userId);
		const subscription = await this.subscriptionService.getMySubscription(userId);

		if (!subscription?.stripeSubscriptionId) {
			throw new BadRequestException('Aucun abonnement Stripe trouvé');
		}

		// Annuler via Stripe
		const updated = await this.stripeService.cancelSubscription(
			subscription.stripeSubscriptionId,
			body.immediate ?? false,
		);

		// Mettre à jour localement
		const result = this.stripeService.handleSubscriptionUpdated(updated);
		return this.subscriptionService.upsertFromStripeEvent(result);
	}

	// Webhook Stripe (non sécurisé pour le dev, sécurisé en prod)
	@Post('webhook')
	@ApiOperation({ summary: 'Webhook Stripe (reçoit les événements Stripe)' })
	async handleWebhook(@Request() req: RawBodyRequest<any>) {
		const signature = req.headers['stripe-signature'] as string;
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

		if (!signature || !webhookSecret) {
			throw new BadRequestException('Signature ou secret webhook manquant');
		}

		let event: any;

		try {
			// Construire l'événement Stripe en vérifiant la signature
			event = this.stripeService.constructWebhookEvent(
				req.rawBody || Buffer.from(JSON.stringify(req.body)),
				signature,
				webhookSecret,
			);
		} catch (error: any) {
			throw new BadRequestException(`Signature invalide: ${error.message}`);
		}

		// Traiter l'événement
		switch (event.type) {
			case 'customer.subscription.created':
				{
					const subscription = event.data.object as any;
					const data = this.stripeService.handleSubscriptionCreated(subscription);
					await this.subscriptionService.upsertFromStripeEvent(data);
					console.log('✓ Abonnement créé:', subscription.id);
				}
				break;

			case 'checkout.session.completed':
				{
					const session = event.data.object as any;
					const userId = Number(session.metadata?.userId || '0');
					const subscriptionId = session.subscription as string | undefined;
					if (subscriptionId && userId) {
						await this.syncFromStripeSubscription(subscriptionId);
						console.log('✓ Checkout terminé:', session.id, 'userId:', userId);
					}
				}
				break;

			case 'customer.subscription.updated':
				{
					const subscription = event.data.object as any;
					const data = this.stripeService.handleSubscriptionUpdated(subscription);
					await this.subscriptionService.upsertFromStripeEvent(data);
					console.log('✓ Abonnement mis à jour:', subscription.id);
				}
				break;

			case 'customer.subscription.deleted':
				{
					const subscription = event.data.object as any;
					const data = this.stripeService.handleSubscriptionDeleted(subscription);
					await this.subscriptionService.upsertFromStripeEvent(data);
					console.log('✓ Abonnement supprimé:', subscription.id);
				}
				break;

			case 'customer.subscription.trial_will_end':
				{
					const subscription = event.data.object as any;
					const data = this.stripeService.handleSubscriptionTrialWillEnd(subscription);
					console.log('⚠️  Trial se termine bientôt pour userId:', data.userId);
					// Optionnel: envoyer une notification à l'utilisateur
				}
				break;

			case 'invoice.payment_failed':
				{
					const invoice = event.data.object as any;
					console.log('❌ Paiement échoué pour subscription:', invoice.subscription);
				}
				break;

			case 'invoice.payment_succeeded':
				{
					const invoice = event.data.object as any;
					if (invoice.subscription) {
						await this.syncFromStripeSubscription(invoice.subscription as string);
					}
					console.log('✓ Paiement réussi pour subscription:', invoice.subscription);
				}
				break;

			case 'invoice.paid':
				{
					const invoice = event.data.object as any;
					if (invoice.subscription) {
						await this.syncFromStripeSubscription(invoice.subscription as string);
					}
					console.log('✓ Invoice payée pour subscription:', invoice.subscription);
				}
				break;

			default:
				console.log('Event non traité:', event.type);
		}

		return { received: true };
	}

	// Endpoint de simulation webhook pour avancer sans compte Stripe (DEV seulement).
	@Post('simulate-webhook')
	@ApiOperation({ summary: 'Simuler un webhook Stripe (mode développement UNIQUEMENT)' })
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
