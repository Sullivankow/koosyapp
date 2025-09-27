import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Bien } from '../biens/bien.entity';

export enum TacheStatut {
	A_FAIRE = 'à faire',
	TERMINEE = 'terminée',
}

@Entity('tache')
export class Tache {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	titre: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ type: 'enum', enum: TacheStatut, default: TacheStatut.A_FAIRE })
	statut: TacheStatut;

	@ManyToOne(() => Bien, bien => bien.taches, { onDelete: 'CASCADE' })
	bien: Bien;

	@Column({ type: 'date', nullable: true })
	dateEcheance?: string;

	@CreateDateColumn()
	dateCreation: Date;

	@UpdateDateColumn()
	dateModification: Date;
}
