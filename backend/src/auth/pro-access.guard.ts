import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProAccessGuard implements CanActivate {
	constructor(
		// Service abonnement (active / trialing).
		private readonly subscriptionService: SubscriptionService,
		// Service utilisateur (accès bêta temporaire).
		private readonly usersService: UsersService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const userId = Number(request.user?.userId);

		if (!request.user || Number.isNaN(userId)) {
			throw new UnauthorizedException('Utilisateur non authentifié');
		}

		// 1) Cas standard: l'utilisateur possède un abonnement pro valide.
		const hasSubscriptionAccess = await this.subscriptionService.hasProAccess(userId);
		if (hasSubscriptionAccess) {
			return true;
		}

		// 2) Cas bêta: accès temporaire accordé même sans paiement.
		const hasBetaAccess = await this.usersService.hasBetaAccess(userId);
		if (hasBetaAccess) {
			return true;
		}

		// 3) Sinon, on bloque les fonctionnalités premium.
		throw new ForbiddenException(
			'Accès premium requis: abonnement actif ou accès bêta valide nécessaire.',
		);
	}
}
