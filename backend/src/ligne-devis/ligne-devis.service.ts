import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LigneDevis } from './ligne-devis.entity';
import { CreateLigneDevisDto } from './create-ligne-devis.dto';

@Injectable()
export class LigneDevisService {
  constructor(
    @InjectRepository(LigneDevis)
    private ligneDevisRepository: Repository<LigneDevis>,
  ) {}

  /**
   * Crée une nouvelle ligne de devis.
   * Calcule automatiquement le montant TTC à partir du HT et du taux de TVA.
   */
  create(createLigneDevisDto: CreateLigneDevisDto) {
    const { devis, totalLigneHT, tva, ...rest } = createLigneDevisDto;
    // Calcul automatique du TTC
    const totalLigneTTC = totalLigneHT + (totalLigneHT * (tva ?? 0) / 100);
    // Création de l'entité LigneDevis avec la relation vers le devis
    const ligne = this.ligneDevisRepository.create({
      ...rest,
      totalLigneHT,
      tva,
      totalLigneTTC,
      devis: { id: devis },
    });
    return this.ligneDevisRepository.save(ligne);
  }

  /**
   * Récupère toutes les lignes de devis avec leur devis associé.
   */
  findAll() {
    return this.ligneDevisRepository.find({ relations: ['devis'] });
  }

  /**
   * Récupère une ligne de devis par son identifiant (avec le devis associé).
   */
  findOne(id: number) {
    return this.ligneDevisRepository.findOne({ where: { id }, relations: ['devis'] });
  }

  /**
   * Met à jour une ligne de devis existante.
   * Recalcule le montant TTC si le HT ou la TVA changent.
   */
  update(id: number, updateLigneDevisDto: Partial<CreateLigneDevisDto>) {
    const { devis, totalLigneHT, tva, ...rest } = updateLigneDevisDto;
    const updatePayload: any = { ...rest };
    // Si le HT ou la TVA sont fournis, on recalcule le TTC
    if (typeof totalLigneHT === 'number' && typeof tva === 'number') {
      updatePayload.totalLigneTTC = totalLigneHT + (totalLigneHT * tva / 100);
      updatePayload.totalLigneHT = totalLigneHT;
      updatePayload.tva = tva;
    }
    if (devis) {
      updatePayload.devis = { id: devis };
    }
    return this.ligneDevisRepository.update(id, updatePayload);
  }

  /**
   * Supprime une ligne de devis par son identifiant.
   */
  remove(id: number) {
    return this.ligneDevisRepository.delete(id);
  }
}
