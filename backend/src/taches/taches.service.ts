import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tache } from './tache.entity';
import { CreateTacheDto, UpdateTacheDto } from './create-tache.dto';
import { Bien } from '../biens/bien.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class TachesService {
  constructor(
    @InjectRepository(Tache)
    private tacheRepo: Repository<Tache>,
    @InjectRepository(Bien)
    private bienRepo: Repository<Bien>,
  ) {}


  //Méthode spour créer une tâche liée à un bien spécifique
  async createTache(dto: CreateTacheDto, userId: number) {
    const bien = await this.bienRepo.findOne({ where: { id: dto.bienId, conciergerie: { id: userId } } });
    if (!bien) throw new NotFoundException('Bien non trouvé ou non accessible');
    const tache = this.tacheRepo.create({ ...dto, bien });
    return this.tacheRepo.save(tache);
  }


//Méthode pour mettre à jour une tâche existante
async updateTache(id: number, dto: UpdateTacheDto) {
  const tache = await this.tacheRepo.findOne({ where: { id } });
  if (!tache) throw new NotFoundException('Tâche non trouvée');
  Object.assign(tache, dto);
  return this.tacheRepo.save(tache);
}


//Méthode pour supprimer une tâche
async deleteTache(id: number) {
    const tache = await this.tacheRepo.findOne({ where: { id } });
    if (!tache) throw new NotFoundException('Tâche non trouvée');
    await this.tacheRepo.remove(tache);
    return { message: 'Tâche supprimée avec succès' };
}


}
