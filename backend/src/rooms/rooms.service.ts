import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { RoomParticipant } from './room-participant.entity';
import { RoomVote } from './room-vote.entity';
import { MoviesService } from '../movies/movies.service';
import { UsersService } from '../users/users.service';
import { Movie, MovieFilters } from '../movies/movies.types';
import { RoomState, RoomResults } from './rooms.types';
import { RoomsGateway } from './rooms.gateway';
import { RecommendationService } from './recommendation.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(RoomParticipant)
    private readonly participantRepo: Repository<RoomParticipant>,
    @InjectRepository(RoomVote)
    private readonly voteRepo: Repository<RoomVote>,
    private readonly moviesService: MoviesService,
    private readonly usersService: UsersService,
    private readonly gateway: RoomsGateway,
    private readonly recommendationService: RecommendationService,
  ) {}

  async create(userId: string, userEmail: string): Promise<{ code: string }> {
    const code = this.generateCode();
    const room = this.roomRepo.create({ code, hostId: userId });
    await this.roomRepo.save(room);

    const participant = this.participantRepo.create({
      roomId: room.id,
      userId,
      userEmail,
    });
    await this.participantRepo.save(participant);

    return { code };
  }

  async getState(code: string): Promise<RoomState> {
    const room = await this.findByCode(code);
    const participants = await this.participantRepo.find({
      where: { roomId: room.id },
    });

    const userMap = await this.usersService.findByIds(
      participants.map((p) => p.userId),
    );

    return {
      id: room.id,
      code: room.code,
      hostId: room.hostId,
      status: room.status,
      filters: (room.filters as MovieFilters) ?? {},
      movies: (room.movies as Movie[]) ?? [],
      participants: participants.map((p) => ({
        userId: p.userId,
        userEmail: p.userEmail,
        name: userMap.get(p.userId)?.name ?? null,
        avatar: userMap.get(p.userId)?.avatar ?? null,
        hasFinished: p.hasFinished,
      })),
      createdAt: room.createdAt,
    };
  }

  async join(code: string, userId: string, userEmail: string): Promise<void> {
    const room = await this.findByCode(code);

    const existing = await this.participantRepo.findOne({
      where: { roomId: room.id, userId },
    });
    if (existing) return;

    if (room.status !== 'waiting') {
      throw new BadRequestException('Room has already started');
    }

    const participant = this.participantRepo.create({
      roomId: room.id,
      userId,
      userEmail,
    });
    await this.participantRepo.save(participant);

    const state = await this.getState(code);
    this.gateway.emitRoomUpdated(code, state);
  }

  async start(
    code: string,
    userId: string,
    filters: MovieFilters,
  ): Promise<void> {
    const room = await this.findByCode(code);

    if (room.hostId !== userId) {
      throw new ForbiddenException('Only the host can start the room');
    }
    if (room.status !== 'waiting') {
      throw new BadRequestException('Room has already started');
    }

    const result = await this.moviesService.getMovies(filters);
    let movies = result.movies;

    if (movies.length < 15 && result.nextPageToken) {
      const more = await this.moviesService.getMovies({
        ...filters,
        pageToken: result.nextPageToken,
      });
      movies = [...movies, ...more.movies];
    }

    if (movies.length === 0) {
      throw new BadRequestException(
        'No movies found for these filters. Try different filters.',
      );
    }

    room.status = 'voting';
    room.filters = filters as unknown as Record<string, unknown>;
    room.movies = movies;
    await this.roomRepo.save(room);

    const state = await this.getState(code);
    this.gateway.emitRoomUpdated(code, state);
  }

  async vote(
    code: string,
    userId: string,
    movieId: string,
    vote: 'like' | 'dislike',
    movieData: Movie,
  ): Promise<void> {
    const room = await this.findByCode(code);

    if (room.status !== 'voting') {
      throw new BadRequestException('Room is not in voting phase');
    }

    const existing = await this.voteRepo.findOne({
      where: { roomId: room.id, userId, movieId },
    });

    if (existing) {
      await this.voteRepo.update(existing.id, { vote });
    } else {
      const v = this.voteRepo.create({
        roomId: room.id,
        userId,
        movieId,
        vote,
        movieData,
      });
      await this.voteRepo.save(v);
    }

    this.pushLiveRecommendations(room, code).catch(() => {});
  }

  private async pushLiveRecommendations(room: Room, code: string): Promise<void> {
    const [votes, participants] = await Promise.all([
      this.voteRepo.find({ where: { roomId: room.id } }),
      this.participantRepo.find({ where: { roomId: room.id } }),
    ]);

    const candidateMovies = (room.movies as Movie[]) ?? [];
    const participantIds = participants.map((p) => p.userId);
    const ranked = this.recommendationService.recommend(
      votes,
      candidateMovies,
      participantIds,
    );

    // Emit ranked order so the live panel stays up to date for everyone
    this.gateway.emitLiveRecommendations(
      code,
      ranked.map((r) => ({ imdbID: r.movie.imdbID, score: r.score })),
    );

    // Every 5 total votes: re-rank the canonical movie list and top up to 50 films
    if (votes.length > 0 && votes.length % 5 === 0) {
      await this.adaptMoviePool(room, code, votes, participantIds, ranked);
    }
  }

  // Re-ranks the canonical movie list by group preference and fetches more films
  // (preferred genres) to keep the pool at ~50 titles.  Runs every 5 votes.
  private async adaptMoviePool(
    room: Room,
    code: string,
    votes: RoomVote[],
    participantIds: string[],
    ranked: { movie: Movie }[],
  ): Promise<void> {
    // Ranked movies become the new canonical order (best first)
    const rankedMovies = ranked.map((r) => r.movie);
    const existingIds = new Set(rankedMovies.map((m) => m.imdbID));

    // How many more films we need to reach 50
    const needed = Math.max(0, 50 - rankedMovies.length);
    let newMovies: Movie[] = [];

    if (needed > 0) {
      // Determine which genres the group enjoys to guide the fetch
      const userProfiles = this.recommendationService.buildUserProfiles(
        votes,
        participantIds,
      );
      const genreSums = new Map<string, number>();
      const genreCount = new Map<string, number>();
      for (const profile of userProfiles.values()) {
        for (const [genre, weight] of profile.entries()) {
          genreSums.set(genre, (genreSums.get(genre) ?? 0) + weight);
          genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
        }
      }
      const likedGenres = [...genreSums.keys()].filter(
        (g) => (genreSums.get(g)! / genreCount.get(g)!) > 0.3,
      );

      const baseFilters = (room.filters as MovieFilters) ?? {};
      const result = await this.moviesService.getMovies({
        ...baseFilters,
        genres: likedGenres.length > 0 ? likedGenres : undefined,
        sortIndex: Math.floor(Math.random() * 3),
      });

      newMovies = result.movies
        .filter((m) => !existingIds.has(m.imdbID))
        .slice(0, needed);
    }

    room.movies = [...rankedMovies, ...newMovies];
    await this.roomRepo.save(room);

    const state = await this.getState(code);
    this.gateway.emitRoomUpdated(code, state);
  }

  async finish(code: string, userId: string): Promise<void> {
    const room = await this.findByCode(code);

    if (room.status !== 'voting') {
      throw new BadRequestException('Room is not in voting phase');
    }

    await this.participantRepo.update(
      { roomId: room.id, userId },
      { hasFinished: true },
    );

    const all = await this.participantRepo.find({ where: { roomId: room.id } });
    if (all.every((p) => p.hasFinished)) {
      await this.roomRepo.update(room.id, { status: 'results' });
    }

    const state = await this.getState(code);
    this.gateway.emitRoomUpdated(code, state);
  }

  async getResults(code: string): Promise<RoomResults> {
    const room = await this.findByCode(code);
    const [votes, participants] = await Promise.all([
      this.voteRepo.find({ where: { roomId: room.id } }),
      this.participantRepo.find({ where: { roomId: room.id } }),
    ]);

    const candidateMovies = (room.movies as Movie[]) ?? [];
    const participantIds = participants.map((p) => p.userId);

    const movies = this.recommendationService.recommend(
      votes,
      candidateMovies,
      participantIds,
    );

    return { code, movies };
  }

  private async findByCode(code: string): Promise<Room> {
    const room = await this.roomRepo.findOne({ where: { code } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  private generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
