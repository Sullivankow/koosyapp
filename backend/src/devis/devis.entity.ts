
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Entreprise } from '../entreprise/entreprise.entity';
import { LigneDevis } from '../ligne-devis/ligne-devis.entity';
import { Proprietaire } from '../proprietaire/proprietaire.entity';

@Entity()
export class Devis {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	numero: string;

	@CreateDateColumn()
	dateCreation: Date;

	@Column({ nullable: true })
	dateValidite: Date;

	@Column({ default: 'brouillon' })
	statut: string; // brouillon, envoyé, accepté, refusé, expiré

	@Column('decimal', { precision: 10, scale: 2, default: 0 })
	montantHT: number;

	@Column('decimal', { precision: 10, scale: 2, default: 0 })
	montantTVA: number;

	@Column('decimal', { precision: 10, scale: 2, default: 0 })
	montantTTC: number;

	@Column({ type: 'text', nullable: true })
	conditions: string;

	@Column({ type: 'text', nullable: true })
	notes: string;

	@Column({ type: 'text', nullable: true })
	lieuPrestation: string;

	@ManyToOne(() => Entreprise, { nullable: false, onDelete: 'CASCADE' })
	entreprise: Entreprise;

	/**
	 * Propriétaire lié au devis
	 */
	@ManyToOne(() => Proprietaire, { nullable: true, onDelete: 'CASCADE' })
	proprietaire: Proprietaire;

	@OneToMany(() => LigneDevis, ligne => ligne.devis, { cascade: true })
	lignes: LigneDevis[];

	@UpdateDateColumn()
	updatedAt: Date;
}
