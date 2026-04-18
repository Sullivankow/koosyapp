import { Injectable } from '@nestjs/common';
import type { SubscriptionStatus } from './subscription.entity';

const Stripe = require('stripe');

@Injectable()
export class StripeService {
	private stripe: any;

	private toDateFromUnix(value: unknown): Date | null {
		const timestamp = typeof value === 'number' ? value : Number(value);
		if (!Number.isFinite(timestamp) || timestamp <= 0) {
			return null;
		}
		const date = new Date(timestamp * 1000);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	private normalizeStatus(status: unknown): SubscriptionStatus {
		const allowed: SubscriptionStatus[] = [
			'incomplete',
			'trialing',
			'active',
			'past_due',
			'canceled',
			'unpaid',
		];
		if (typeof status === 'string' && allowed.includes(status as SubscriptionStatus)) {
			return status as SubscriptionStatus;
		}
		return 'incomplete';
	}

	constructor() {
		// Initialiser Stripe avec la clé secrète depuis les variables d'env
		const stripeKey = process.env.STRIPE_SECRET_KEY || '';
		this.stripe = new Stripe(stripeKey);
	}

	/**
	 * Crée une session Stripe Checkout.
	 * @param customerId - ID client Stripe (cus_xxx). Peut être null pour nouveau client.
	 * @param priceId - ID du prix Stripe (price_xxx).
	 * @param successUrl - URL de redirection après paiement réussi.
	 * @param cancelUrl - URL de redirection après annulation.
	 * @param trialDays - Nombre de jours d'essai (optionnel).
	 * @param userId - ID utilisateur local pour le metadata.
	 * @returns URL de la session Stripe.
	 */
	async createCheckoutSession(
		customerId: string | null,
		priceId: string,
		successUrl: string,
		cancelUrl: string,
		trialDays?: number,
		userId?: number,
	): Promise<string> {
		const session = await this.stripe.checkout.sessions.create({
			mode: 'subscription',
			payment_method_types: ['card'],
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			...(customerId ? { customer: customerId } : {}),
			success_url: successUrl,
			cancel_url: cancelUrl,
			subscription_data:
				trialDays && trialDays > 0
					? {
						metadata: {
							userId: userId ? String(userId) : 'unknown',
						},
							trial_period_days: trialDays,
					  }
					: {
						metadata: {
							userId: userId ? String(userId) : 'unknown',
						},
					  },
			metadata: {
				userId: userId ? String(userId) : 'unknown',
			},
		});

		return session.url || '';
	}

	/**
	 * Récupère une session Stripe Checkout par son ID.
	 * Utile pour vérifier le statut après paiement.
	 */
	async getCheckoutSession(sessionId: string) {
		return this.stripe.checkout.sessions.retrieve(sessionId);
	}

	/**
	 * Récupère un abonnement Stripe par son ID.
	 */
	async getSubscription(subscriptionId: string) {
		return this.stripe.subscriptions.retrieve(subscriptionId);
	}

	/**
	 * Annule un abonnement Stripe.
	 * @param subscriptionId - ID de l'abonnement Stripe.
	 * @param immediate - Si true, annulation immédiate. Si false, fin de période.
	 */
	async cancelSubscription(
		subscriptionId: string,
		immediate: boolean = false,
	) {
		const current = await this.getSubscription(subscriptionId);

		// Stripe refuse toute mise à jour "classique" d'un abonnement déjà annulé.
		if (current?.status === 'canceled') {
			return current;
		}

		if (immediate) {
			return this.stripe.subscriptions.cancel(subscriptionId);
		}

		// Annulation en fin de période: si déjà demandé, on ne fait rien.
		if (current?.cancel_at_period_end) {
			return current;
		}

		return this.stripe.subscriptions.update(subscriptionId, {
			cancel_at_period_end: true,
		});
	}

	/**
	 * Récupère un client Stripe par son ID.
	 */
	async getCustomer(customerId: string) {
		return this.stripe.customers.retrieve(customerId);
	}

	/**
	 * Construit un événement webhook en vérifiant la signature.
	 * @param body - Corps cru de la requête HTTP.
	 * @param signature - Header `stripe-signature` de la requête.
	 * @returns Événement Stripe vérifié.
	 */
	constructWebhookEvent(
		body: Buffer | string,
		signature: string,
		webhookSecret: string,
	) {
		return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
	}

	/**
	 * Handleur pour événement 'customer.subscription.created'
	 */
	handleSubscriptionCreated(subscription: any): {
		userId: number;
		stripeCustomerId: string;
		stripeSubscriptionId: string;
		stripePriceId: string;
		status: SubscriptionStatus;
		currentPeriodStart: Date | null;
		currentPeriodEnd: Date | null;
		trialEnd: Date | null;
	} {
		return {
			userId: parseInt(subscription.metadata?.userId || '0', 10),
			stripeCustomerId: subscription.customer as string,
			stripeSubscriptionId: subscription.id,
			stripePriceId:
				(subscription.items?.data?.[0]?.price?.id as string) ||
				(subscription.metadata?.priceId as string),
			status: this.normalizeStatus(subscription.status),
			currentPeriodStart: this.toDateFromUnix(subscription.current_period_start),
			currentPeriodEnd: this.toDateFromUnix(subscription.current_period_end),
			trialEnd: this.toDateFromUnix(subscription.trial_end),
		};
	}

	/**
	 * Handleur pour événement 'customer.subscription.updated'
	 */
	handleSubscriptionUpdated(subscription: any): {
		userId: number;
		status: SubscriptionStatus;
		currentPeriodEnd: Date | null;
		cancelAtPeriodEnd: boolean;
		canceledAt: Date | null;
		trialEnd: Date | null;
	} {
		return {
			userId: parseInt(subscription.metadata?.userId || '0', 10),
			status: this.normalizeStatus(subscription.status),
			currentPeriodEnd: this.toDateFromUnix(subscription.current_period_end),
			cancelAtPeriodEnd: subscription.cancel_at_period_end,
			canceledAt: this.toDateFromUnix(subscription.canceled_at),
			trialEnd: this.toDateFromUnix(subscription.trial_end),
		};
	}

	/**
	 * Handleur pour événement 'customer.subscription.deleted'
	 * (souvent triggered par annulation immédiate)
	 */
	handleSubscriptionDeleted(subscription: any): {
		userId: number;
		status: SubscriptionStatus;
		canceledAt: Date;
	} {
		return {
			userId: parseInt(subscription.metadata?.userId || '0', 10),
			status: 'canceled',
			canceledAt: this.toDateFromUnix(subscription.canceled_at) || new Date(),
		};
	}

	/**
	 * Handleur pour événement 'customer.subscription.trial_will_end'
	 */
	handleSubscriptionTrialWillEnd(subscription: any): {
		userId: number;
		trialEnd: Date;
	} {
		return {
			userId: parseInt(subscription.metadata?.userId || '0', 10),
			trialEnd: this.toDateFromUnix(subscription.trial_end) || new Date(),
		};
	}
}
