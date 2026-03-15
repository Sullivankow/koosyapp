import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facture } from './facture.entity';
import { CreateFactureDto } from './create-facture.dto';

@Injectable()
export class FactureService {
  constructor(
    @InjectRepository(Facture)
    private factureRepository: Repository<Facture>,
  ) {}

  create(createFactureDto: CreateFactureDto) {
    const { entreprise, ...rest } = createFactureDto;
    const facture = this.factureRepository.create({
      ...rest,
      entreprise: { id: entreprise },
    });
    return this.factureRepository.save(facture);
  }

  findAll() {
    return this.factureRepository.find({ relations: ['entreprise', 'lignes'] });
  }

  findOne(id: number) {
    return this.factureRepository.findOne({ where: { id }, relations: ['entreprise', 'lignes'] });
  }

  update(id: number, updateFactureDto: Partial<CreateFactureDto>) {
    const { entreprise, ...rest } = updateFactureDto;
    const updatePayload: any = { ...rest };
    if (entreprise) {
      updatePayload.entreprise = { id: entreprise };
    }
    return this.factureRepository.update(id, updatePayload);
  }

  remove(id: number) {
    return this.factureRepository.delete(id);
  }
}
