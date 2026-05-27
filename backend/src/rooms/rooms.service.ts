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

    await this.participantRepo.save(
      this.participantRepo.create({ roomId: room.id, userId, userEmail }),
    );

    return { code };
  }

  async getState(code: string): Promise<RoomState> {
    const room = await this.findByCode(code);
    const participants = await this.participantRepo.find({
      where: { roomId: room.id },
    });
    const userMap = await this.usersService.findByIds(
      participants.map((participant) => participant.userId),
    );

    return {
      id: room.id,
      code: room.code,
      hostId: room.hostId,
      status: room.status,
      filters: (room.filters as MovieFilters) ?? {},
      movies: (room.movies as Movie[]) ?? [],
      participants: participants.map((participant) => ({
        userId: participant.userId,
        userEmail: participant.userEmail,
        name: userMap.get(participant.userId)?.name ?? null,
        avatar: userMap.get(participant.userId)?.avatar ?? null,
        hasFinished: participant.hasFinished,
      })),
      createdAt: room.createdAt,
    };
  }

  async join(code: string, userId: string, userEmail: string): Promise<void> {
    const room = await this.findByCode(code);

    const alreadyJoined = await this.participantRepo.findOne({
      where: { roomId: room.id, userId },
    });
    if (alreadyJoined) return;

    if (room.status !== 'waiting') {
      throw new BadRequestException('Room has already started');
    }

    try {
      await this.participantRepo.save(
        this.participantRepo.create({ roomId: room.id, userId, userEmail }),
      );
    } catch (err: unknown) {
      const isUniqueViolation =
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === '23505';
      if (!isUniqueViolation) throw err;
      return;
    }

    this.gateway.emitRoomUpdated(code, await this.getState(code));
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

    const firstPage = await this.moviesService.getMovies(filters);
    let movies = firstPage.movies;

    if (movies.length < 15 && firstPage.nextPageToken) {
      const secondPage = await this.moviesService.getMovies({
        ...filters,
        pageToken: firstPage.nextPageToken,
      });
      movies = [...movies, ...secondPage.movies];
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

    this.gateway.emitRoomUpdated(code, await this.getState(code));
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

    const existingVote = await this.voteRepo.findOne({
      where: { roomId: room.id, userId, movieId },
    });

    if (existingVote) {
      await this.voteRepo.update(existingVote.id, { vote });
    } else {
      await this.voteRepo.save(
        this.voteRepo.create({
          roomId: room.id,
          userId,
          movieId,
          vote,
          movieData,
        }),
      );
    }

    this.pushLiveRecommendations(room, code).catch(() => {});
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

    const allParticipants = await this.participantRepo.find({
      where: { roomId: room.id },
    });
    if (allParticipants.every((participant) => participant.hasFinished)) {
      await this.roomRepo.update(room.id, { status: 'results' });
    }

    this.gateway.emitRoomUpdated(code, await this.getState(code));
  }

  async getResults(code: string): Promise<RoomResults> {
    const room = await this.findByCode(code);
    const [votes, participants] = await Promise.all([
      this.voteRepo.find({ where: { roomId: room.id } }),
      this.participantRepo.find({ where: { roomId: room.id } }),
    ]);

    const movies = this.recommendationService.recommend(
      votes,
      (room.movies as Movie[]) ?? [],
      participants.map((participant) => participant.userId),
    );

    return { code, movies };
  }

  private async pushLiveRecommendations(
    room: Room,
    code: string,
  ): Promise<void> {
    const [votes, participants] = await Promise.all([
      this.voteRepo.find({ where: { roomId: room.id } }),
      this.participantRepo.find({ where: { roomId: room.id } }),
    ]);

    const participantIds = participants.map(
      (participant) => participant.userId,
    );
    const ranked = this.recommendationService.recommend(
      votes,
      (room.movies as Movie[]) ?? [],
      participantIds,
    );

    this.gateway.emitLiveRecommendations(
      code,
      ranked.map((result) => ({
        imdbID: result.movie.imdbID,
        score: result.score,
      })),
    );

    if (votes.length > 0 && votes.length % 5 === 0) {
      await this.adaptMoviePool(room, code, votes, participantIds, ranked);
    }
  }

  // Re-ranks the pool by current group preferences and fetches more movies
  // in liked genres to keep the total at ~50 titles. Runs every 5 votes.
  private async adaptMoviePool(
    room: Room,
    code: string,
    votes: RoomVote[],
    participantIds: string[],
    ranked: { movie: Movie }[],
  ): Promise<void> {
    const rankedMovies = ranked.map((result) => result.movie);
    const existingIds = new Set(rankedMovies.map((movie) => movie.imdbID));
    const needed = Math.max(0, 50 - rankedMovies.length);
    let newMovies: Movie[] = [];

    if (needed > 0) {
      const likedGenres = this.resolveGroupLikedGenres(votes, participantIds);
      const fetchResult = await this.moviesService.getMovies({
        ...((room.filters as MovieFilters) ?? {}),
        genres: likedGenres.length > 0 ? likedGenres : undefined,
        sortIndex: Math.floor(Math.random() * 3),
      });
      newMovies = fetchResult.movies
        .filter((movie) => !existingIds.has(movie.imdbID))
        .slice(0, needed);
    }

    room.movies = [...rankedMovies, ...newMovies];
    await this.roomRepo.save(room);

    this.gateway.emitRoomUpdated(code, await this.getState(code));
  }

  // Returns genres where the group's average weight exceeds the 0.3 threshold.
  private resolveGroupLikedGenres(
    votes: RoomVote[],
    participantIds: string[],
  ): string[] {
    const userProfiles = this.recommendationService.buildUserProfiles(
      votes,
      participantIds,
    );
    const genreWeightSums = new Map<string, number>();
    const genreProfileCount = new Map<string, number>();

    for (const profile of userProfiles.values()) {
      for (const [genre, weight] of profile.entries()) {
        genreWeightSums.set(genre, (genreWeightSums.get(genre) ?? 0) + weight);
        genreProfileCount.set(genre, (genreProfileCount.get(genre) ?? 0) + 1);
      }
    }

    return [...genreWeightSums.keys()].filter(
      (genre) =>
        genreWeightSums.get(genre)! / genreProfileCount.get(genre)! > 0.3,
    );
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
