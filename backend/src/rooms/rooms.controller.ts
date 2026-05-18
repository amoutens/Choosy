import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { Movie, MovieFilters } from '../movies/movies.types';

interface AuthRequest {
  user: { id: string; email: string };
}

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Request() req: AuthRequest) {
    return this.roomsService.create(req.user.id, req.user.email);
  }

  @Get(':code')
  getState(@Param('code') code: string) {
    return this.roomsService.getState(code);
  }

  @Get(':code/results')
  getResults(@Param('code') code: string) {
    return this.roomsService.getResults(code);
  }

  @Post(':code/join')
  join(@Param('code') code: string, @Request() req: AuthRequest) {
    return this.roomsService.join(code, req.user.id, req.user.email);
  }

  @Post(':code/start')
  start(
    @Param('code') code: string,
    @Request() req: AuthRequest,
    @Body() body: { filters?: MovieFilters },
  ) {
    return this.roomsService.start(code, req.user.id, body.filters ?? {});
  }

  @Post(':code/vote')
  vote(
    @Param('code') code: string,
    @Request() req: AuthRequest,
    @Body()
    body: { movieId: string; vote: 'like' | 'dislike'; movieData: Movie },
  ) {
    return this.roomsService.vote(
      code,
      req.user.id,
      body.movieId,
      body.vote,
      body.movieData,
    );
  }

  @Post(':code/finish')
  finish(@Param('code') code: string, @Request() req: AuthRequest) {
    return this.roomsService.finish(code, req.user.id);
  }
}
