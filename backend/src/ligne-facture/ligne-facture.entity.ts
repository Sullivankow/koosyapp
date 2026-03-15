import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Facture } from '../facture/facture.entity';

@Entity()
export class LigneFacture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantite: number;

  @Column('decimal', { precision: 10, scale: 2 })
  prixUnitaireHT: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  tva: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalLigneHT: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalLigneTTC: number;

  @ManyToOne(() => Facture, facture => facture.lignes, { nullable: false, onDelete: 'CASCADE' })
  facture: Facture;
}
