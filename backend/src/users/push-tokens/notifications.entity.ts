import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity({ name: 'notifications' })
export class Notification {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => (user as any).notifications, { onDelete: 'CASCADE' })
	user: User;

	@Column()
	title: string;

	@Column('text')
	body: string;

	@Column({ type: 'json', nullable: true })
	data?: any;

	@Column({ default: false })
	read: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;
}
