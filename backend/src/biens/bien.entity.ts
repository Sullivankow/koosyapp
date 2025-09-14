import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';


@Entity()
export class Bien {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  adresse: string;

  @Column()
  type: string;

  @Column('float')
  superficie: number;

  @Column('int')
  pieces: number;

  @Column('simple-array', { nullable: true })
  equipements: string[];

  @Column('simple-array', { nullable: true })
  photos: string[];

  @Column({ default: 'disponible' })
  statut: 'disponible' | 'occupé' | 'travaux';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  // Pour la relation avec le propriétaire
  @ManyToOne(() => User, user => user.biens)
  proprio: User;

  // Pour la géolocalisation
  @Column('float', { nullable: true })
  lat: number;

  @Column('float', { nullable: true })
  lng: number;

  // Les autres relations (locataires, taches, commentaires, historique) peuvent être ajoutées plus tard
}