import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from './movie.entity';
import { Genre } from './genre.entity';

@Entity('movie_genre')
export class MovieGenre {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ name: 'movie_id' })
  movieId: number;

  @PrimaryColumn({ name: 'genre_id' })
  genreId: number;

  @ManyToOne(() => Movie, (movie) => movie.genres, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'movie_id', referencedColumnName: 'id' }])
  movies: Movie[];

  @ManyToOne(() => Genre, (genre) => genre.movies, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'genre_id', referencedColumnName: 'id' }])
  genres: Genre[];
}
