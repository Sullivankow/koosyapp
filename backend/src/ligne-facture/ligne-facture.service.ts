import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LigneFacture } from './ligne-facture.entity';
import { CreateLigneFactureDto } from './create-ligne-facture.dto';

@Injectable()
export class LigneFactureService {
  constructor(
    @InjectRepository(LigneFacture)
    private ligneFactureRepository: Repository<LigneFacture>,
  ) {}

  /**
   * Crée une nouvelle ligne de facture.
   * Calcule automatiquement le montant TTC à partir du HT et du taux de TVA.
   */
  create(createLigneFactureDto: CreateLigneFactureDto) {
    const { facture, totalLigneHT, tauxTVA, ...rest } = createLigneFactureDto;
    // Calcul automatique du TTC
    const totalLigneTTC = totalLigneHT + (totalLigneHT * (tauxTVA ?? 0) / 100);
    // Création de l'entité LigneFacture avec la relation vers la facture
    const ligne = this.ligneFactureRepository.create({
      ...rest,
      totalLigneHT,
      tauxTVA,
      totalLigneTTC,
      facture: { id: facture },
    });
    return this.ligneFactureRepository.save(ligne);
  }

  /**
   * Récupère toutes les lignes de facture avec leur facture associée.
   */
  findAll() {
    return this.ligneFactureRepository.find({ relations: ['facture'] });
  }

  /**
   * Récupère une ligne de facture par son identifiant (avec la facture associée).
   */
  findOne(id: number) {
    return this.ligneFactureRepository.findOne({ where: { id }, relations: ['facture'] });
  }

  /**
   * Met à jour une ligne de facture existante.
   * Recalcule le montant TTC si le HT ou la TVA changent.
   */
  update(id: number, updateLigneFactureDto: Partial<CreateLigneFactureDto>) {
    const { facture, totalLigneHT, tauxTVA, ...rest } = updateLigneFactureDto;
    const updatePayload: any = { ...rest };
    // Si le HT ou la TVA sont fournis, on recalcule le TTC
    if (typeof totalLigneHT === 'number' && typeof tauxTVA === 'number') {
      updatePayload.totalLigneTTC = totalLigneHT + (totalLigneHT * tauxTVA / 100);
      updatePayload.totalLigneHT = totalLigneHT;
      updatePayload.tauxTVA = tauxTVA;
    }
    if (facture) {
      updatePayload.facture = { id: facture };
    }
    return this.ligneFactureRepository.update(id, updatePayload);
  }

  /**
   * Supprime une ligne de facture par son identifiant.
   */
  remove(id: number) {
    return this.ligneFactureRepository.delete(id);
  }
}
