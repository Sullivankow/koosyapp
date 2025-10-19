import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../user.entity';

@Entity({ name: 'user_push_tokens' })
@Index(['user', 'token'], { unique: true })
export class UserPushToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => (user as any).pushTokens, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'varchar', length: 20, default: 'unknown' })
  platform: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
