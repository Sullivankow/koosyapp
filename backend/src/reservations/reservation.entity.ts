import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Bien } from '../biens/bien.entity';
import { Locataire } from '../locataires/locataire.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  //Relation avec le bien et locataire
  @ManyToOne(() => Bien, bien => bien.reservations)
  bien: Bien;

  //Relation avec le locataire
  @ManyToOne(() => Locataire, locataire => locataire.reservations)
  locataire: Locataire;

  @Column({ type: 'date' })
  dateDebut: Date;

  @Column({ type: 'date' })
  dateFin: Date;

  @Column({ default: 'en attente' })
  statut: 'en attente' | 'confirmée' | 'terminée' | 'annulée';

  /**
   * Date de création automatique de la réservation.
   * Utilisée pour détecter les "nouvelles réservations" côté backend
   * (par ex. event type `new_reservation`).
   
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Date de dernière mise à jour automatique (utile pour audits et sync).
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}