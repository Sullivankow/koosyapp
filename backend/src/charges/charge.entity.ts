import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('charges')
export class Charge {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // ID utilisateur dénormalisé pour filtrer rapidement les charges.
  @Column()
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  // Montant en centimes pour éviter les problèmes d'arrondis flottants.
  @Column({ type: 'integer' })
  amount_cents: number;

  @Column({ type: 'varchar', length: 3, default: 'EUR' })
  currency: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  // Date métier sans heure pour simplifier les filtres mensuels.
  date_charge: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  categorie?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
