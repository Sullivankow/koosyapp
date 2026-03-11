import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { OneToMany } from 'typeorm';
import { Reservation } from '../reservations/reservation.entity';
import { Tache } from '../taches/tache.entity';
import { BienImage } from '../Image/image.entity';


@Entity()
export class Bien {


  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  proprietaireNom: string;

 

  @Column()
  proprietaireEmail: string;

  @Column()
  proprietaireTelephone: string;
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

  // Les autres relations (locataires, taches, commentaires, historique) peuvent être ajoutées plus tard
}