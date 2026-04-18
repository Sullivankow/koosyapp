import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proprietaire } from './proprietaire.entity';
import { CreateProprietaireDto } from './create-proprietaire.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ProprietaireService {
	constructor(
		@InjectRepository(Proprietaire)
		private readonly proprietaireRepository: Repository<Proprietaire>,
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
	) {}


	/**
	 * Crée un propriétaire lié à l'utilisateur connecté (conciergerie).
	 * Applique un quota de 5 pour les comptes gratuits (hors accès bêta/premium).
	 */
	async create(dto: CreateProprietaireDto, userId: number) {
		// Récupère l'utilisateur connecté
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) throw new NotFoundException('Utilisateur non trouvé');

		// Vérifie l'accès bêta
		const hasBetaAccess = user.betaAccessUntil && new Date(user.betaAccessUntil).getTime() >= Date.now();

		// Si gratuit et pas bêta, applique le quota
		if (user.abonnement === 'gratuit' && !hasBetaAccess) {
			const count = await this.proprietaireRepository.count({ where: { conciergerie: { id: userId } } });
			if (count >= 5) {
				throw new ForbiddenException('Limite atteinte : abonnement gratuit limité à 5 propriétaires.');
			}
		}

		// Crée le propriétaire lié à l'utilisateur
		const proprietaire = this.proprietaireRepository.create({ ...dto, conciergerie: user });
		return this.proprietaireRepository.save(proprietaire);
	}

	/**
	 * Retourne tous les propriétaires de l'utilisateur connecté.
	 */
	findAll(userId: number) {
		return this.proprietaireRepository.find({ where: { conciergerie: { id: userId } } });
	}

	findOne(id: number, userId: number) {
		return this.proprietaireRepository.findOne({ where: { id, conciergerie: { id: userId } } });
	}

	update(id: number, dto: Partial<CreateProprietaireDto>) {
		return this.proprietaireRepository.update(id, dto);
	}

	remove(id: number) {
		return this.proprietaireRepository.delete(id);
	}

	/**
	 * Retourne le quota de propriétaires pour l'utilisateur connecté.
	 */
	async getProprietaireQuota(userId: number) {
		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) throw new NotFoundException('Utilisateur non trouvé');
		const active = await this.proprietaireRepository.count({ where: { conciergerie: { id: userId } } });
		const hasBetaAccess = user.betaAccessUntil && new Date(user.betaAccessUntil).getTime() >= Date.now();

		if (hasBetaAccess) {
			return {
				plan: user.abonnement === 'premium' ? 'premium' : 'gratuit',
				accessLevel: 'beta',
				limit: null,
				used: active,
				remaining: null,
				active,
				isLimited: false,
			};
		}
		if (user.abonnement !== 'gratuit') {
			return {
				plan: 'premium',
				accessLevel: 'premium',
				limit: null,
				used: active,
				remaining: null,
				active,
				isLimited: false,
			};
		}
		// Plan gratuit
		return {
			plan: 'gratuit',
			accessLevel: 'gratuit',
			limit: 5,
			used: active,
			remaining: Math.max(0, 5 - active),
			active,
			   isLimited: true,
		};
	}
}
