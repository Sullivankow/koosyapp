import {Entity , PrimaryGeneratedColumn, Column } from 'typeorm'; 


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
}