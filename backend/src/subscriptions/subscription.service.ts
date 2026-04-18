import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from './subscription.entity';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { User } from '../users/user.entity';
import { StripeService } from './stripe.service';

@Injectable()
export class SubscriptionService {
	constructor(
		// Repository de la table subscriptions.
		@InjectRepository(Subscription)
		private readonly subscriptionRepository: Repository<Subscription>,
		// Repository users pour vérifier l'existence du compte lié.
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly stripeService: StripeService,
	) {}

	// Retourne l'abonnement de l'utilisateur connecté, ou null s'il n'existe pas encore.
	async getMySubscription(userId: number): Promise<Subscription | null> {
		return this.subscriptionRepository.findOne({ where: { userId } });
	}

	// Crée (ou met à jour) une ligne d'abonnement locale avant l'appel Stripe réel.
	async prepareCheckout(userId: number, dto: CreateSubscriptionDto): Promise<any> {
		// Vérification défensive: on s'assure que l'utilisateur existe bien.
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('Utilisateur introuvable');
		}

		// On récupère l'abonnement existant pour éviter les doublons.
		const existing = await this.subscriptionRepository.findOne({ where: { userId } });

		// Si pas d'abonnement en base, on initialise une nouvelle ligne.
		const subscription = existing ?? this.subscriptionRepository.create({ userId });

		// On stocke les informations de prix dès maintenant pour l'effet "grandfathering".
		subscription.stripePriceId = dto.priceId;
		subscription.amount = dto.amount;
		subscription.currency = dto.currency?.toUpperCase() || 'EUR';
		subscription.status = existing?.status ?? 'incomplete';
		subscription.metadata = {
			...(subscription.metadata || {}),
			checkoutPreparedAt: new Date().toISOString(),
			successUrl: dto.successUrl,
			cancelUrl: dto.cancelUrl,
			trialDays: dto.trialDays ?? 0,
		};

		// Sauvegarde de l'état local.
		await this.subscriptionRepository.save(subscription);

		// Ici on retourne la charge utile à utiliser plus tard avec Stripe Checkout.
		// Tant que vous n'avez pas les clés Stripe, ce retour vous permet d'avancer côté front.
		return {
			message:
				'Préparation enregistrée. Branchez Stripe ensuite pour créer la session checkout côté backend.',
			userId,
			stripePayload: {
				mode: 'subscription',
				line_items: [{ price: dto.priceId, quantity: 1 }],
				success_url: dto.successUrl,
				cancel_url: dto.cancelUrl,
				subscription_data:
					dto.trialDays && dto.trialDays > 0
						? { trial_period_days: dto.trialDays }
						: undefined,
				metadata: {
					userId: String(userId),
					localSubscriptionId: String(subscription.id),
				},
			},
			localSubscriptionId: subscription.id,
		};
	}

	// Met à jour l'abonnement local à partir d'un événement webhook Stripe.
	async upsertFromStripeEvent(input: {
		userId: number;
		stripeCustomerId?: string;
		stripeSubscriptionId?: string;
		stripePriceId?: string;
		status?: SubscriptionStatus;
		currentPeriodStart?: Date | null;
		currentPeriodEnd?: Date | null;
		trialEnd?: Date | null;
		cancelAtPeriodEnd?: boolean;
		canceledAt?: Date | null;
		metadata?: Record<string, any>;
	}): Promise<Subscription> {
		const existing = await this.subscriptionRepository.findOne({
			where: { userId: input.userId },
		});

		const subscription =
			existing ?? this.subscriptionRepository.create({ userId: input.userId });

		// On met à jour uniquement les champs présents dans le payload.
		if (input.stripeCustomerId !== undefined) {
			subscription.stripeCustomerId = input.stripeCustomerId;
		}
		if (input.stripeSubscriptionId !== undefined) {
			subscription.stripeSubscriptionId = input.stripeSubscriptionId;
		}
		if (input.stripePriceId !== undefined) {
			subscription.stripePriceId = input.stripePriceId;
		}
		if (input.status !== undefined) {
			subscription.status = input.status;
		}
		if (input.currentPeriodStart !== undefined) {
			subscription.currentPeriodStart = input.currentPeriodStart;
		}
		if (input.currentPeriodEnd !== undefined) {
			subscription.currentPeriodEnd = input.currentPeriodEnd;
		}
		if (input.trialEnd !== undefined) {
			subscription.trialEnd = input.trialEnd;
		}
		if (input.cancelAtPeriodEnd !== undefined) {
			subscription.cancelAtPeriodEnd = input.cancelAtPeriodEnd;
		}
		if (input.canceledAt !== undefined) {
			subscription.canceledAt = input.canceledAt;
		}
		if (input.metadata !== undefined) {
			subscription.metadata = {
				...(subscription.metadata || {}),
				...input.metadata,
			};
		}

		return this.subscriptionRepository.save(subscription);
	}

	// Indique simplement si l'utilisateur possède un abonnement donnant accès aux features pro.
	async hasProAccess(userId: number): Promise<boolean> {
		const subscription = await this.subscriptionRepository.findOne({ where: { userId } });
		if (!subscription) return false;
		return ['trialing', 'active'].includes(subscription.status);
	}

	// Permet à un admin d'annuler l'abonnement d'un utilisateur cible.
	async cancelSubscriptionForUser(userId: number, immediate = false): Promise<Subscription> {
		const user = await this.userRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('Utilisateur introuvable');
		}

		const subscription = await this.subscriptionRepository.findOne({ where: { userId } });
		if (!subscription) {
			throw new NotFoundException('Aucun abonnement trouvé pour cet utilisateur');
		}

		let updatedSubscription: Subscription;

		if (subscription.stripeSubscriptionId) {
			const updated = await this.stripeService.cancelSubscription(
				subscription.stripeSubscriptionId,
				immediate,
			);
			const result = this.stripeService.handleSubscriptionUpdated(updated);
			updatedSubscription = await this.upsertFromStripeEvent({ ...result, userId });
		} else {
			updatedSubscription = await this.upsertFromStripeEvent({
				userId,
				status: 'canceled',
				cancelAtPeriodEnd: !immediate,
				canceledAt: new Date(),
				metadata: {
					...(subscription.metadata || {}),
					adminCanceledAt: new Date().toISOString(),
				},
			});
		}

		// On garde le champ utilisateur cohérent avec une annulation manuelle admin.
		user.abonnement = 'gratuit';
		await this.userRepository.save(user);

		return updatedSubscription;
	}
}
