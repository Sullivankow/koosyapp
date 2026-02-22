import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestation } from './prestation.entity';
import { CreatePrestationDto } from './create-prestation.dto';
import { Bien } from '../biens/bien.entity';

/**
 * Service gérant la logique métier des prestations.
 * - création (conversion euros -> centimes)
 * - listing paginé
 * - agrégation (chiffre d'affaires par bien et global)
 */
@Injectable()
export class PrestationService {
	constructor(
		@InjectRepository(Prestation)
		private prestationRepo: Repository<Prestation>,
		@InjectRepository(Bien)
		private bienRepo: Repository<Bien>,
	) {}

	/**
	 * Crée une prestation. Le montant envoyé est en euros (float) et sera converti
	 * en centimes pour stockage (integer) afin d'éviter les imprécisions.
	 * - Vérifie que le bien existe et appartient à la conciergerie si nécessaire.
	 */
	async create(dto: CreatePrestationDto, userId: number) {
		const bien = await this.bienRepo.findOne({ where: { id: dto.bienId } });
		if (!bien) throw new NotFoundException('Bien non trouvé');

		if (typeof dto.amount !== 'number' || isNaN(dto.amount)) throw new BadRequestException('Montant invalide');

		const amount_cents = Math.round(dto.amount * 100);

		const p = this.prestationRepo.create({
			bien: { id: dto.bienId } as any,
			user: { id: userId } as any,
			description: dto.description,
			amount_cents,
			currency: 'EUR',
			date_prestation: dto.date_prestation ?? new Date().toISOString().slice(0, 10),
		});

		return this.prestationRepo.save(p);
	}

	/**
	 * Liste paginée des prestations, filtrable par `bienId`.
	 */
	async list({ bienId, page = 1, limit = 20 }: { bienId?: number; page?: number; limit?: number }) {
		const qb = this.prestationRepo.createQueryBuilder('p').leftJoinAndSelect('p.bien', 'bien').leftJoinAndSelect('p.user', 'user').orderBy('p.date_prestation', 'DESC');

		if (bienId) qb.andWhere('p.bien = :bienId', { bienId });

		qb.skip((page - 1) * limit).take(limit);

		const [items, total] = await qb.getManyAndCount();
		return { items, total, page, limit };
	}

	/**
	 * Retourne le chiffre d'affaires agrégé entre deux dates (incluses).
	 * Renvoie par bien et un total global. Les montants renvoyés incluent
	 * `total_cents` et `total_euros` pour faciliter l'affichage côté client.
	 */
	async summary({ from, to }: { from: string; to: string }) {
		// Totaux par bien
		const perBien = await this.prestationRepo
			.createQueryBuilder('p')
			.select('p.bien_id', 'bienId')
			.addSelect('SUM(p.amount_cents)', 'total_cents')
			.where('p.date_prestation BETWEEN :from AND :to', { from, to })
			.andWhere("p.status = :st", { st: 'confirmed' })
			.groupBy('p.bien_id')
			.getRawMany();

		const formattedPerBien = perBien.map(r => ({ bienId: Number(r.bienid ?? r.bienId), total_cents: Number(r.total_cents), total_euros: Number(r.total_cents) / 100 }));

		// Total global
		const globalRow = await this.prestationRepo
			.createQueryBuilder('p')
			.select('SUM(p.amount_cents)', 'total_cents')
			.where('p.date_prestation BETWEEN :from AND :to', { from, to })
			.andWhere("p.status = :st", { st: 'confirmed' })
			.getRawOne();

		const globalTotalCents = Number(globalRow?.total_cents ?? 0);

		return {
			perBien: formattedPerBien,
			global: { total_cents: globalTotalCents, total_euros: globalTotalCents / 100 },
		};
	}





	
}

