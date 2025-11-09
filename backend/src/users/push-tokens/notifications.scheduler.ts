import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TachesService } from '../../taches/taches.service';
import { NotificationsService } from './notification.service';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly tachesService: TachesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Exécute tous les jours à 08:00 (heure du serveur)
  @Cron('0 8 * * *')
  async handleDailyTaskReminders() {
    this.logger.log('Lancement du cron: recherche tâches pour rappel (demain)');
    try {
      const taches = await this.tachesService.getTachesRappelPourDemain();
      this.logger.log(`Tâches trouvées pour rappel: ${taches.length}`);
      let sent = 0;
      for (const tache of taches) {
        const user = tache.bien?.conciergerie;
        if (!user || !user.id) continue;
        try {
          // Vérification simple de doublon : existe-t-il déjà une notif rappel pour cette tache aujourd'hui ?
          const exists = await this.notificationsService.existsReminderForTache(user.id, tache.id);
          if (exists) continue;

          const title = 'Rappel tâche — demain';
          const body = `La tâche "${tache.titre}" est prévue demain (${tache.dateEcheance})`;
          await this.notificationsService.createAndSend(user.id, title, body, { type: 'rappel', tacheId: tache.id });
          sent++;
        } catch (err) {
          this.logger.warn(`Erreur en envoyant le rappel pour la tâche ${tache.id}: ${err}`);
        }
      }
      this.logger.log(`Rappels envoyés: ${sent}`);
    } catch (err) {
      this.logger.error('Erreur lors du cron de rappels de tâches', err);
    }
  }
}
