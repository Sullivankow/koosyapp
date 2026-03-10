import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestation } from './prestation.entity';
import { CreatePrestationDto } from './create-prestation.dto';
import { Bien } from '../biens/bien.entity';
import { UpdatePrestationDto } from './create-prestation.dto';


export enum PrestationStatus {
  PENDING = 'En attente',
  CONFIRMED = 'Confirmée',
  CANCELLED = 'Annulée',
  COMPLETED = 'Terminée',
  
}




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
			  status: dto.status ?? 'confirmed',
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
	async summary({ from, to, status }: { from: string; to: string; status?: string }) {
		const st = status || 'Terminée';
		// Totaux par bien
		const perBien = await this.prestationRepo
			.createQueryBuilder('p')
			.select('p.bien_id', 'bienId')
			.addSelect('SUM(p.amount_cents)', 'total_cents')
			.where('p.date_prestation BETWEEN :from AND :to', { from, to })
			.andWhere("p.status = :st", { st })
			.groupBy('p.bien_id')
			.getRawMany();

		const formattedPerBien = perBien.map(r => ({ bienId: Number(r.bienid ?? r.bienId), total_cents: Number(r.total_cents), total_euros: Number(r.total_cents) / 100 }));

		// Total global
		const globalRow = await this.prestationRepo
			.createQueryBuilder('p')
			.select('SUM(p.amount_cents)', 'total_cents')
			.where('p.date_prestation BETWEEN :from AND :to', { from, to })
			.andWhere("p.status = :st", { st })
			.getRawOne();

		const globalTotalCents = Number(globalRow?.total_cents ?? 0);

		return {
			perBien: formattedPerBien,
			global: { total_cents: globalTotalCents, total_euros: globalTotalCents / 100 },
		};
	}

	// Retourne le CA par mois sur une période donnée
	async monthlySummary({ from, to }: { from: string; to: string }) {
		const results: { mois: string; total_cents: number; total_euros: number }[] = [];
		let current = new Date(from);
		const end = new Date(to);

		while (current <= end) {
			const year = current.getFullYear();
			const month = current.getMonth();
			const firstDay = new Date(year, month, 1);
			const lastDay = new Date(year, month + 1, 0); // dernier jour du mois
			const fromStr = firstDay.toISOString().slice(0, 10);
			const toStr = lastDay.toISOString().slice(0, 10);

			const row = await this.prestationRepo
				.createQueryBuilder('p')
				.select('SUM(p.amount_cents)', 'total_cents')
				.where('p.date_prestation BETWEEN :from AND :to', { from: fromStr, to: toStr })
				.andWhere("p.status = :st", { st: 'confirmed' })
				.getRawOne();

			const totalCents = Number(row?.total_cents ?? 0);
			results.push({
				mois: `${year}-${String(month + 1).padStart(2, '0')}`,
				total_cents: totalCents,
				total_euros: totalCents / 100,
			});

			// Passe au mois suivant
			current = new Date(year, month + 1, 1);
		}

		return results;
	}

// Méthode pour modifer une prestation, les champs sont optionnels

async update(id: number, dto: UpdatePrestationDto) {
  const prestation = await this.prestationRepo.findOne({ where: { id } });
  if (!prestation) throw new NotFoundException('Prestation non trouvée');

  if (dto.bienId) {
    const bien = await this.bienRepo.findOne({ where: { id: dto.bienId } });
    if (!bien) throw new NotFoundException('Bien non trouvé');
    prestation.bien = bien;
  }

  Object.assign(prestation, dto);

  if (dto.amount !== undefined) {
    if (typeof dto.amount !== 'number' || isNaN(dto.amount)) throw new BadRequestException('Montant invalide');
    prestation.amount_cents = Math.round(dto.amount * 100);
  }

  return this.prestationRepo.save(prestation);
}


//Méthode pour supprimer une prestation 
async remove(id: number) {
  const prestation = await this.prestationRepo.findOne({ where: { id } });
  if (!prestation) throw new NotFoundException('Prestation non trouvée');
  await this.prestationRepo.remove(prestation);
  return { message: 'Prestation supprimée avec succès' };
}


//Méthode pour changer le status de la prestation 


async changeStatus(id: number, status: PrestationStatus) {
	if (!Object.values(PrestationStatus).includes(status)) {
		throw new BadRequestException('Statut invalide');
	}
	const prestation = await this.prestationRepo.findOne({ where: { id } });
	if (!prestation) throw new NotFoundException('Prestation non trouvée');
	prestation.status = status;
	return this.prestationRepo.save(prestation);
}




//Méthode pour afficher uniquement les prestations terminées 

/**
 * Retourne toutes les prestations terminées (non paginé)
 */
 async findAllTerminees(): Promise<Prestation[]> {
	return this.prestationRepo.find({ where: { status: PrestationStatus.COMPLETED } });
}

}