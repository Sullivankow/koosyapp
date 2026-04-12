import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Charge } from './charge.entity';
import { CreateChargeDto, UpdateChargeDto } from './create-charge.dto';

const normalizeChargeDate = (value?: string) => {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  const frenchMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (frenchMatch) {
    const [, day, month, year] = frenchMatch;
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return undefined;
};

@Injectable()
export class ChargesService {
  private readonly logger = new Logger(ChargesService.name);

  constructor(
    @InjectRepository(Charge)
    private readonly chargesRepo: Repository<Charge>,
  ) {}

  async create(dto: CreateChargeDto, userId: number) {
    const normalizedDate = normalizeChargeDate(dto.date_charge);
    // On transforme la saisie humaine en format base de données avant le save.
    this.logger.log(
      `create called userId=${userId} libelle=${dto.libelle} amount=${dto.amount} date_charge=${dto.date_charge} normalizedDate=${normalizedDate ?? 'undefined'}`,
    );
    const entity = this.chargesRepo.create({
      user: { id: userId } as any,
      userId,
      libelle: dto.libelle,
      amount_cents: Math.round(dto.amount * 100),
      currency: 'EUR',
      date_charge: normalizedDate,
      categorie: dto.categorie,
      notes: dto.notes,
    });
    try {
      const saved = await this.chargesRepo.save(entity);
      this.logger.log(`charge saved id=${saved.id} userId=${userId}`);
      return saved;
    } catch (error) {
      this.logger.error(`charge save failed userId=${userId}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async list(userId: number, page = 1, limit = 20, from?: string, to?: string) {
    const qb = this.chargesRepo
      .createQueryBuilder('c')
      .where('c.userId = :userId', { userId })
      .orderBy('c.date_charge', 'DESC')
      .addOrderBy('c.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (from && to) {
      qb.andWhere('c.date_charge BETWEEN :from AND :to', { from, to });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async summary(userId: number, from: string, to: string) {
    // Ce total alimente le calcul de marge sur le dashboard.
    const row = await this.chargesRepo
      .createQueryBuilder('c')
      .select('SUM(c.amount_cents)', 'total_cents')
      .where('c.userId = :userId', { userId })
      .andWhere('c.date_charge BETWEEN :from AND :to', { from, to })
      .getRawOne();

    const totalCents = Number(row?.total_cents ?? 0);
    return {
      global: {
        total_cents: totalCents,
        total_euros: totalCents / 100,
      },
    };
  }

  async update(id: number, userId: number, dto: UpdateChargeDto) {
    const charge = await this.chargesRepo.findOne({ where: { id, userId } });
    if (!charge) throw new NotFoundException('Charge non trouvée');

    if (dto.libelle !== undefined) charge.libelle = dto.libelle;
    if (dto.amount !== undefined) charge.amount_cents = Math.round(dto.amount * 100);
    if (dto.date_charge !== undefined) {
      const normalizedDate = normalizeChargeDate(dto.date_charge);
      if (normalizedDate) {
        charge.date_charge = normalizedDate;
      }
    }
    if (dto.categorie !== undefined) charge.categorie = dto.categorie;
    if (dto.notes !== undefined) charge.notes = dto.notes;

    return this.chargesRepo.save(charge);
  }

  async remove(id: number, userId: number) {
    const charge = await this.chargesRepo.findOne({ where: { id, userId } });
    if (!charge) throw new NotFoundException('Charge non trouvée');

    await this.chargesRepo.remove(charge);
    return { message: 'Charge supprimée avec succès' };
  }
}
