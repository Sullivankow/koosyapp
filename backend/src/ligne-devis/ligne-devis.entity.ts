import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Devis } from '../devis/devis.entity';

@Entity()
export class LigneDevis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantite: number;

  @Column('decimal', { precision: 10, scale: 2 })
  prixUnitaireHT: number;

  // Taux TVA en pourcentage (ex: 20 pour 20%)
  @Column('decimal', { precision: 5, scale: 2, default: 20 })
  tauxTVA: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalLigneHT: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalLigneTTC: number;

  @ManyToOne(() => Devis, devis => devis.lignes, { nullable: false, onDelete: 'CASCADE' })
  devis: Devis;
}
