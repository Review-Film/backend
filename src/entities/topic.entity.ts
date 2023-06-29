import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public name: string;

  @Column({ unique: true })
  public url: string;

  @Column({ default: 1 })
  public priority: number;
}
