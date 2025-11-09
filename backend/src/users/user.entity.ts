import {Entity , PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'; 
import { Bien } from '../biens/bien.entity';
import { UserPushToken } from './push-tokens/user-push-token.entity';
import { Notification } from './push-tokens/notifications.entity';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  
   @Column({ default: 'gratuit' })
  abonnement: 'gratuit' | 'premium';


// Token Expo Push pour notifications
@Column({ type: 'text', nullable: true })
expoPushToken: string | null;

  /**
   * Paramètres utilisateur génériques (JSONB recommandé en production).
   *
   * Exemple: { "eventsEnabled": true, "notifFreq": "quotidien" }
   *
   * Remarques:
   * - Nous utilisons `type: 'json'` côté TypeORM; en Postgres la colonne sera
   *   stockée sous forme JSONB si vous exécutez la migration correspondante.
   * - Ce champ est nullable pour compatibilité avec les lignes existantes.
   */
  @Column({ type: 'json', nullable: true })
  settings: any;

//Relation avec les biens
@OneToMany(() => Bien, bien => bien.conciergerie)
biens: Bien[];

  @OneToMany(() => UserPushToken, t => t.user)
  pushTokens: UserPushToken[];

  @OneToMany(() => Notification, n => n.user)
  notifications: Notification[];


}