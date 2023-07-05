import {
  Body,
  Catch,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/entities/';
import { MovieService } from './movie.service';

@Controller('movie')
@ApiTags('Movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('/')
  @ApiResponse({
    status: 200,
    description: 'Get movies successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Get movies unsuccessfully',
  })
  async getMovies(@Query() queries) {
    const { email } = queries;
    const movies = await this.movieService.getMovies();
    return movies;
  }
}
