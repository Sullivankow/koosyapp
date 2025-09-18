import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tache } from './tache.entity';
import { CreateTacheDto, UpdateTacheDto } from './create-tache.dto';
import { Bien } from '../biens/bien.entity';
import { NotFoundException } from '@nestjs/common';
import { Not } from 'typeorm';
import { TacheStatut } from './tache.entity';
// import dynamique dans la méthode


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

//Méthode pour supprimer toutes les tâches avec le status terminée
async deleteAllTachesTerminees(): Promise<{ deletedCount: number }> {
  const { TacheStatut } = require('./tache.entity');
  const result = await this.tacheRepo.delete({ statut: TacheStatut.TERMINEE });
  return { deletedCount: result.affected || 0 };
}


//Méthode pour marquer une tâche comme terminée
async markTacheAsTerminee(id: number): Promise<Tache> {
  const tache = await this.tacheRepo.findOne({ where: { id } });
  if (!tache) throw new NotFoundException('Tâche non trouvée');
  tache.statut = TacheStatut.TERMINEE;
  return this.tacheRepo.save(tache);
}

//Méthode pour supprimer une tâche
async deleteTache(id: number) {
    const tache = await this.tacheRepo.findOne({ where: { id } });
    if (!tache) throw new NotFoundException('Tâche non trouvée');
    await this.tacheRepo.remove(tache);
    return { message: 'Tâche supprimée avec succès' };
}


//Méthode pour récupérer une tâche la veille de sa date d'échéance
async getTachesRappelPourDemain(): Promise<Tache[]> {
  const today = new Date();
  const demain = new Date(today);
  demain.setDate(today.getDate() + 1);

  // Format JJ/MM/AAAA
  const jour = String(demain.getDate()).padStart(2, '0');
  const mois = String(demain.getMonth() + 1).padStart(2, '0');
  const annee = demain.getFullYear();
  const dateDemain = `${jour}/${mois}/${annee}`;

  return this.tacheRepo.find({
    where: {
      dateEcheance: dateDemain,
      statut: Not(TacheStatut.TERMINEE),
    },
    relations: ['bien'],
  });






}


//Méthode pour envoyer une notification push via Expo
async sendExpoPushNotification(token: string, title: string, body: string) {
  const fetch = (await import('node-fetch')).default;
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: token,
      title,
      body,
      sound: 'default',
    }),
  });
}

async envoyerRappelsTachesPourDemain() {
  const taches = await this.getTachesRappelPourDemain();
  let notificationsEnvoyees = 0;
  for (const tache of taches) {
    const user = tache.bien.conciergerie; // ou tache.bien.proprietaire selon ton modèle
    if (user && user.expoPushToken) {
      await this.sendExpoPushNotification(
        user.expoPushToken,
        'Rappel tâche',
        `La tâche "${tache.titre}" est prévue demain (${tache.dateEcheance})`
      );
      notificationsEnvoyees++;
    }
  }
  return {
    success: true,
    message: `Notifications envoyées : ${notificationsEnvoyees}`,
    count: notificationsEnvoyees,
  };
}

//Méthode pour compter les tâches à faire le jour donné 
async countTachesAFairePourDate(date: string, userId: number): Promise<number> {
    // Conversion JJ/MM/AAAA -> YYYY-MM-DD
    let dateISO = date;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [jour, mois, annee] = date.split('/');
      dateISO = `${annee}-${mois}-${jour}`;
    }
    return this.tacheRepo.count({
      where: {
        dateEcheance: dateISO,
        statut: TacheStatut.A_FAIRE,
        bien: { conciergerie: { id: userId } }
      },
      relations: ['bien'],
    });
}




}
