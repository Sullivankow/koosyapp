import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
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
}