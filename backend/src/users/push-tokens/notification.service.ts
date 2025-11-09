import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notifications.entity';
import { Repository, DataSource } from 'typeorm';
import { PushTokensService } from './push-tokens.service'; // service existant
import { TachesService } from '../../taches/taches.service'; // si tu veux réutiliser sendExpoPushNotification

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly pushTokensService: PushTokensService,
    private readonly tachesService: TachesService, // contient sendExpoPushNotification wrapper
    private readonly dataSource: DataSource,
  ) {}

  // Crée la notif en DB, calcule unread count, envoie le push (transactionnel)
  async createAndSend(userId: number, title: string, body: string, data?: any) {
    return this.dataSource.transaction(async manager => {
      // 1) créer notification
      const notif = manager.create(Notification, {
        user: { id: userId } as any,
        title,
        body,
        data,
        read: false,
      });
      const saved = await manager.save(notif);

      // 2) calculer unread
      const unread = await manager.count(Notification, {
        where: { user: { id: userId } as any, read: false },
      });

      // 3) récupérer tokens et envoyer
      const tokens = await this.pushTokensService.getTokensForUser(userId);
      const tokenStrings = tokens.map(t => t.token);

      // envoi batch (<=100)
      const batches: string[][] = [];
      for (let i = 0; i < tokenStrings.length; i += 100) {
        batches.push(tokenStrings.slice(i, i + 100));
      }

      let sent = 0;
      for (const batch of batches) {
        // envoyer chaque message (utilise tachesService.sendExpoPushNotification ou ton wrapper)
        // tu peux adapter selon ton implémentation: si ton send accepts single token, boucle
        for (const token of batch) {
          try {
            await this.tachesService.sendExpoPushNotification(token, title, body, {
              ...data,
              notificationId: saved.id,
              badge: unread,
            } as any); // adapter signature
            sent++;
          } catch (err) {
            // gérer DeviceNotRegistered
            const msg = err?.message || String(err);
            this.logger.warn(`Push send failed for token ${token}: ${msg}`);
            if (msg.includes('DeviceNotRegistered') || msg.includes('not registered')) {
              await this.pushTokensService.deleteToken(userId, token);
            }
          }
        }
      }

      return { notification: saved, unread, sent };
    });
  }

  // Récupère le nombre de notifications non lues pour un utilisateur
  async getUnreadCount(userId: number): Promise<number> {
    return this.repo.count({ where: { user: { id: userId } as any, read: false } });
  }


  // Liste les notifications pour un utilisateur avec pagination
  async list(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { user: { id: userId } as any },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { items, total, page, limit };
  }


  // Marque une notification comme lue et retourne le nouveau count des non-lues
  async markRead(userId: number, id: number) {
    await this.repo.update({ id, user: { id: userId } as any }, { read: true });
    return this.getUnreadCount(userId);
  }


  // Marque toutes les notifications comme lues et retourne le nouveau count des non-lues
  async markAllRead(userId: number) {
    await this.repo.update({ user: { id: userId } as any, read: false }, { read: true });
    return this.getUnreadCount(userId);
  }

  // Vérifie s'il existe déjà un rappel (notification) pour une tache donnée aujourd'hui
  async existsReminderForTache(userId: number, tacheId: number): Promise<boolean> {
    // Postgres JSON field query using ->> operator to compare text
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const qb = this.repo.createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .andWhere("(n.data ->> 'type') = :type", { type: 'rappel' })
      .andWhere("(n.data ->> 'tacheId') = :tacheId", { tacheId: String(tacheId) })
      .andWhere('n.created_at >= :todayStart', { todayStart: todayStart.toISOString() })
      .limit(1);
    const existing = await qb.getOne();
    return !!existing;
  }

  // Supprime une notification si elle appartient à l'utilisateur
  async delete(userId: number, id: number) {
    const res = await this.repo.delete({ id, user: { id: userId } as any });
    // res.affected indique combien d'enregistrements supprimés
    const deleted = !!res.affected;
    const unread = await this.getUnreadCount(userId);
    return { deleted, unread };
  }
}