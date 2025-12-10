import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Bien } from '../biens/bien.entity';
import { User } from '../users/user.entity';

/**
 * Entité Prestation
 * - Les montants sont stockés en centimes (`amount_cents` integer) pour éviter
 *   les problèmes d'arrondis flottants.
 * - `currency` par défaut à 'EUR'.
 * - relation ManyToOne vers `Bien` et `User` (créateur / conciergerie).
 */
@Entity({ name: 'prestations' })
export class Prestation {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Bien, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'bien_id' })
	bien: Bien;

	@ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'user_id' })
	user?: User;

	@Column({ type: 'text', nullable: true })
	description?: string;

	// Montant en centimes (ex: 1250 = 12,50 EUR)
	@Column({ type: 'integer' })
	amount_cents: number;

	@Column({ type: 'varchar', length: 3, default: 'EUR' })
	currency: string;

	// Date à laquelle la prestation a eu lieu (par défaut la date du jour)
	@Column({ type: 'date', default: () => 'CURRENT_DATE' })
	date_prestation: string;

	// Statut utile pour exclure par ex. les prestations annulées du CA
	@Column({ type: 'varchar', length: 20, default: 'confirmed' })
	status: string;

	@CreateDateColumn({ type: 'timestamptz' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updated_at: Date;
}

