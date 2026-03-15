import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Entreprise } from '../entreprise/entreprise.entity';
import { LigneFacture } from '../ligne-facture/ligne-facture.entity';

@Entity()
export class Facture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  numero: string;

  @CreateDateColumn()
  dateEmission: Date;

  @Column({ nullable: true })
  dateEcheance: Date;

  @Column({ default: 'brouillon' })
  statut: string; // brouillon, envoyée, payée, en retard, annulée

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montantHT: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montantTVA: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  montantTTC: number;

  @Column({ type: 'text', nullable: true })
  conditionsPaiement: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Entreprise, { nullable: false, onDelete: 'CASCADE' })
  entreprise: Entreprise;

  @OneToMany(() => LigneFacture, (ligne: LigneFacture) => ligne.facture, { cascade: true })
  lignes: LigneFacture[];

  @UpdateDateColumn()
  updatedAt: Date;
}
