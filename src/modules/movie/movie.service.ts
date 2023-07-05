import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User, Roles, Movie } from 'src/entities';
import { In, Repository } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async getMovies() {
    const movies = await this.movieRepository.find({
      relations: ['genres'],
    });

    return movies;
  }
}
