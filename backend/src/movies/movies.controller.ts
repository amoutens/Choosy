import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toArray, toFloat, toInt } from '../common/query.helpers';
import { MoviesService } from './movies.service';

interface MoviesQuery {
  types?: string | string[];
  genres?: string | string[];
  minRating?: string;
  maxRating?: string;
  startYear?: string;
  endYear?: string;
  pageToken?: string;
  sortIndex?: string;
}

@Controller('movies')
@UseGuards(JwtAuthGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  getMovies(@Query() query: MoviesQuery) {
    return this.moviesService.getMovies({
      types: toArray(query.types),
      genres: toArray(query.genres),
      minRating: toFloat(query.minRating),
      maxRating: toFloat(query.maxRating),
      startYear: toInt(query.startYear),
      endYear: toInt(query.endYear),
      pageToken: query.pageToken,
      sortIndex: toInt(query.sortIndex),
    });
  }
}
