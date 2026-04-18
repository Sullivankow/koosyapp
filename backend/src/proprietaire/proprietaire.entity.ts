import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
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

    /**
     * Lien vers l'utilisateur (conciergerie) qui a créé ce propriétaire.
     * Permet de gérer le quota par utilisateur.
     */
    @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
    conciergerie: User;
}
