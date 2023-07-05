import { IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  context: string;

  @Column()
  message: string;

  @Column()
  level: string;

  @CreateDateColumn()
  creationDate: Date;
}
