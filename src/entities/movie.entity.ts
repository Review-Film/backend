import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Genre } from './genre.entity';
import { Artist } from './artist.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  shortUrl: string;

  @Column()
  description: string;

  @Column()
  year: string;

  @Column()
  releasedDate: Date;

  @ManyToMany(() => Genre, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinTable({
    name: 'movie_genre',
    joinColumn: {
      name: 'movie_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'genre_id',
      referencedColumnName: 'id',
    },
  })
  genres: Genre[];

  @ManyToMany(() => Artist, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinTable({
    name: 'movie_director',
    joinColumn: {
      name: 'movie_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'artist_id',
      referencedColumnName: 'id',
    },
  })
  directors: Artist[];

  @ManyToMany(() => Artist, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinTable({
    name: 'movie_writer',
    joinColumn: {
      name: 'movie_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'artist_id',
      referencedColumnName: 'id',
    },
  })
  writers: Artist[];

  @ManyToMany(() => Artist, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinTable({
    name: 'movie_actor',
    joinColumn: {
      name: 'movie_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'artist_id',
      referencedColumnName: 'id',
    },
  })
  actors: Artist[];
}
