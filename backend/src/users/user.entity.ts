import {Entity , PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'; 
import { Bien } from '../biens/bien.entity';


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

//Relation avec les biens
@OneToMany(() => Bien, bien => bien.conciergerie)
biens: Bien[];


}