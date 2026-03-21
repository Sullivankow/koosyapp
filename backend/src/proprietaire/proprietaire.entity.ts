import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Devis } from '../devis/devis.entity';

/**
 * Entité représentant un propriétaire (pour devis/factures)
 */
@Entity()
export class Proprietaire {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	nom: string;

	@Column()
	prenom: string;

	@Column({ unique: true })
	email: string;

	@Column()
	adresse: string;

	@Column()
	telephone: string;

	// Un propriétaire peut être lié à plusieurs devis
	@OneToMany(() => Devis, devis => devis.proprietaire)
	devis: Devis[];

	// Un propriétaire peut être lié à plusieurs biens
	@OneToMany(() => require('../biens/bien.entity').Bien, (bien: any) => bien.proprietaire)
	biens: any[];
}
