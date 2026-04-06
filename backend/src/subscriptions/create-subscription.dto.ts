import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateSubscriptionDto {
	// Identifiant du prix Stripe (price_xxx) que vous configurerez dans le dashboard Stripe.
	@IsString()
	@IsNotEmpty()
	priceId!: string;

	// URL où Stripe renvoie l'utilisateur après paiement validé.
	@IsString()
	@IsUrl()
	successUrl!: string;

	// URL où Stripe renvoie l'utilisateur si le paiement est annulé.
	@IsString()
	@IsUrl()
	cancelUrl!: string;

	// Montant du plan en euros pour mémoriser le tarif historique (grandfathering).
	@IsNumber()
	@Min(0)
	amount!: number;

	// Devise ISO (EUR, USD...).
	@IsString()
	@IsNotEmpty()
	currency!: string;

	// Nombre de jours d'essai optionnel.
	@IsOptional()
	@IsNumber()
	@Min(0)
	trialDays?: number;
}
