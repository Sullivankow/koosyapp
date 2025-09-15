import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from '../reservations/reservation.entity';

@Entity()
export class Locataire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  telephone: string;

  // Relation avec les réservations
  @OneToMany(() => Reservation, reservation => reservation.locataire)
  reservations: Reservation[];
}