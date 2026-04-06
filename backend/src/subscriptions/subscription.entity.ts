import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

// Statuts principaux d'un abonnement Stripe côté application.
export type SubscriptionStatus =
	| 'incomplete'
	| 'trialing'
	| 'active'
	| 'past_due'
	| 'canceled'
	| 'unpaid';

@Entity('subscriptions')
export class Subscription {
	// Clé primaire interne de la table.
	@PrimaryGeneratedColumn()
	id!: number;

	// Relation vers l'utilisateur concerné par l'abonnement.
	@ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user!: User;

	// ID utilisateur dénormalisé pour filtrer rapidement sans charger la relation.
	@Column()
	userId!: number;

	// Identifiant client Stripe (ex: cus_xxx).
	@Column({ type: 'varchar', length: 255, nullable: true })
	stripeCustomerId!: string | null;

	// Identifiant abonnement Stripe (ex: sub_xxx).
	@Column({ type: 'varchar', length: 255, nullable: true, unique: true })
	stripeSubscriptionId!: string | null;

	// Identifiant du prix Stripe (ex: price_xxx) pour gérer plusieurs tarifs dans le temps.
	@Column({ type: 'varchar', length: 255, nullable: true })
	stripePriceId!: string | null;

	// Statut métier aligné avec Stripe.
	@Column({ type: 'varchar', length: 32, default: 'incomplete' })
	status!: SubscriptionStatus;

	// Montant appliqué au moment de la souscription (utile pour le grandfathering).
	@Column('decimal', { precision: 10, scale: 2, nullable: true })
	amount!: number | null;

	// Devise associée au montant (EUR par défaut).
	@Column({ type: 'varchar', length: 3, default: 'EUR' })
	currency!: string;

	// Date de début de la période de facturation actuelle.
	@Column({ type: 'timestamptz', nullable: true })
	currentPeriodStart!: Date | null;

	// Date de fin de la période de facturation actuelle.
	@Column({ type: 'timestamptz', nullable: true })
	currentPeriodEnd!: Date | null;

	// Date de fin d'essai, si vous activez un trial Stripe.
	@Column({ type: 'timestamptz', nullable: true })
	trialEnd!: Date | null;

	// Date d'annulation demandée (si l'utilisateur coupe le renouvellement).
	@Column({ type: 'timestamptz', nullable: true })
	canceledAt!: Date | null;

	// Flag pour savoir si l'abonnement s'arrête en fin de période.
	@Column({ default: false })
	cancelAtPeriodEnd!: boolean;

	// Espace libre pour stocker des infos Stripe complémentaires (webhook, traces, etc.).
	@Column({ type: 'json', nullable: true })
	metadata!: Record<string, any> | null;

	// Date de création en base.
	@CreateDateColumn()
	createdAt!: Date;

	// Date de dernière mise à jour en base.
	@UpdateDateColumn()
	updatedAt!: Date;
}


