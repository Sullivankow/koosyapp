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

  create(createLigneFactureDto: CreateLigneFactureDto) {
    const { facture, ...rest } = createLigneFactureDto;
    const ligne = this.ligneFactureRepository.create({
      ...rest,
      facture: { id: facture },
    });
    return this.ligneFactureRepository.save(ligne);
  }

  findAll() {
    return this.ligneFactureRepository.find({ relations: ['facture'] });
  }

  findOne(id: number) {
    return this.ligneFactureRepository.findOne({ where: { id }, relations: ['facture'] });
  }

  update(id: number, updateLigneFactureDto: Partial<CreateLigneFactureDto>) {
    const { facture, ...rest } = updateLigneFactureDto;
    const updatePayload: any = { ...rest };
    if (facture) {
      updatePayload.facture = { id: facture };
    }
    return this.ligneFactureRepository.update(id, updatePayload);
  }

  remove(id: number) {
    return this.ligneFactureRepository.delete(id);
  }
}
