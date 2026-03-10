import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entreprise } from './entreprise.entity';

// Service pour la logique métier liée à l'entité Entreprise
@Injectable()
export class EntrepriseService {
  constructor(
    @InjectRepository(Entreprise)
    private readonly entrepriseRepository: Repository<Entreprise>,
  ) {}

  // Exemple : création d'une entreprise
  async create(data: Partial<Entreprise>): Promise<Entreprise> {
    const entreprise = this.entrepriseRepository.create(data);
    return this.entrepriseRepository.save(entreprise);
  }

  // Exemple : récupération d'une entreprise par ID
  async findOne(id: number): Promise<Entreprise | null> {
    return this.entrepriseRepository.findOne({ where: { id } });
  }

  // Exemple : mise à jour d'une entreprise
  async update(id: number, data: Partial<Entreprise>): Promise<Entreprise | null> {
    await this.entrepriseRepository.update(id, data);
    return this.findOne(id);
  }

  // Exemple : suppression d'une entreprise
  async remove(id: number): Promise<void> {
    await this.entrepriseRepository.delete(id);
  }
}
