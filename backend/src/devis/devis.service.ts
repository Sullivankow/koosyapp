import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Devis } from './devis.entity';
import { CreateDevisDto } from './create-devis.dto';

@Injectable()
export class DevisService {
  constructor(
    @InjectRepository(Devis)
    private devisRepository: Repository<Devis>,
  ) {}


  // Lors de la création, on reçoit l'id de l'entreprise, mais on doit associer l'objet Entreprise à la relation
  create(createDevisDto: CreateDevisDto) {
    // On transforme l'id de l'entreprise en objet Entreprise
    const { entreprise, ...rest } = createDevisDto;
    const devis = this.devisRepository.create({
      ...rest,
      entreprise: { id: entreprise },
    });
    return this.devisRepository.save(devis);
  }


  // Lors de la récupération, on veut aussi les données de l'entreprise associée
  findAll() {
    return this.devisRepository.find({ relations: ['entreprise'] });
  }


  // Lors de la récupération d'un devis par id, on veut aussi les données de l'entreprise associée
  findOne(id: number) {
    return this.devisRepository.findOne({ where: { id }, relations: ['entreprise'] });
  }


  // Lors de la mise à jour, on reçoit l'id de l'entreprise, mais on doit associer l'objet Entreprise à la relation
  update(id: number, updateDevisDto: Partial<CreateDevisDto>) {
    const { entreprise, ...rest } = updateDevisDto;
    const updatePayload: any = { ...rest };
    if (entreprise) {
      updatePayload.entreprise = { id: entreprise };
    }
    return this.devisRepository.update(id, updatePayload);
  }


  // Lors de la suppression, on peut simplement supprimer le devis par son id
  remove(id: number) {
    return this.devisRepository.delete(id);
  }
}
