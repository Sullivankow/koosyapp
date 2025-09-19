import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Bien } from '../biens/bien.entity';

@Entity()
export class BienImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string; // chemin ou URL du fichier

  @ManyToOne(() => Bien, bien => bien.images, { onDelete: 'CASCADE' })
  bien: Bien;
}