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

  create(createLigneDevisDto: CreateLigneDevisDto) {
    const { devis, ...rest } = createLigneDevisDto;
    const ligne = this.ligneDevisRepository.create({
      ...rest,
      devis: { id: devis },
    });
    return this.ligneDevisRepository.save(ligne);
  }

  findAll() {
    return this.ligneDevisRepository.find({ relations: ['devis'] });
  }

  findOne(id: number) {
    return this.ligneDevisRepository.findOne({ where: { id }, relations: ['devis'] });
  }

  update(id: number, updateLigneDevisDto: Partial<CreateLigneDevisDto>) {
    const { devis, ...rest } = updateLigneDevisDto;
    const updatePayload: any = { ...rest };
    if (devis) {
      updatePayload.devis = { id: devis };
    }
    return this.ligneDevisRepository.update(id, updatePayload);
  }

  remove(id: number) {
    return this.ligneDevisRepository.delete(id);
  }
}
