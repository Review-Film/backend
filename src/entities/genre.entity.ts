import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @ManyToMany(() => Movie, (movie) => movie.genres, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  movies: Movie[];
}
