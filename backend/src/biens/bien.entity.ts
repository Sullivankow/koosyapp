import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Prestation } from '../prestations/prestation.entity';
import { User } from '../users/user.entity';
import { Reservation } from '../reservations/reservation.entity';
import { Tache } from '../taches/tache.entity';
import { BienImage } from '../Image/image.entity';
import { Proprietaire } from '../proprietaire/proprietaire.entity';


@Entity()
export class Bien {


  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Proprietaire, proprietaire => proprietaire.biens, { nullable: true, onDelete: 'SET NULL' })
  proprietaire: Proprietaire;
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


  @Column({ default: 'disponible' })
  statut: 'disponible' | 'occupé' | 'travaux';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @Column({ nullable: true })
expoPushToken?: string;

  // Pour la relation avec la conciergerie (utilisateur)
  @ManyToOne(() => User, user => user.biens, { onDelete: 'CASCADE' })
  conciergerie: User;
//Pour la relation avec le propriétaire
  @OneToMany(() => Reservation, reservation => reservation.bien)
reservations: Reservation[];

//Pour la relation avec les taches
@OneToMany(() => Tache, tache => tache.bien)
taches: Tache[];

@OneToMany(() => BienImage, image => image.bien, { cascade: true })
images: BienImage[];

//Champs pour les remarques
 @Column({ nullable: true })
  remarque?: string;


  // Pour la géolocalisation
  @Column('float', { nullable: true })
  lat: number;

  @Column('float', { nullable: true })
  lng: number;


  // Relation avec les prestations
  @OneToMany(() => Prestation, prestation => prestation.bien)
  prestations: Prestation[];

  // Les autres relations (locataires, taches, commentaires, historique) peuvent être ajoutées plus tard
}