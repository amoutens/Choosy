import { Injectable } from '@nestjs/common';
import { RoomVote } from './room-vote.entity';
import { Movie } from '../movies/movies.types';

export interface RecommendedResult {
  movie: Movie;
  score: number;
  avgScore: number;
  minScore: number;
  likeCount: number;
  alpha: number;
}

@Injectable()
export class RecommendationService {
  // Entry point — takes all votes in the room, candidate movies, and list of participant IDs.
  // Returns movies sorted by the final group score (best first).
  recommend(
    votes: RoomVote[],
    candidateMovies: Movie[],
    participantIds: string[],
  ): RecommendedResult[] {
    if (candidateMovies.length === 0 || participantIds.length === 0) return [];

    // Step 1: build a genre preference profile for each user
    const userProfiles = this.buildUserProfiles(votes, participantIds);

    // Step 2: score every candidate movie for each user based on their profile
    const cbfScores = this.computeCBFScores(
      candidateMovies,
      userProfiles,
      participantIds,
    );

    // Step 3: find the best balance between Average and Least-Misery strategies.
    // For a solo session there's no group conflict, so we just use Average (α = 1).
    const alpha =
      participantIds.length <= 1
        ? 1.0
        : this.geneticAlgorithm(cbfScores, candidateMovies);

    // Count explicit likes per movie so the UI can show "everyone liked" badges
    const likeCounts = new Map<string, number>();
    for (const vote of votes) {
      if (vote.vote === 'like') {
        likeCounts.set(vote.movieId, (likeCounts.get(vote.movieId) ?? 0) + 1);
      }
    }

    return candidateMovies
      .map((movie) => {
        const scores = cbfScores.get(movie.imdbID) ?? [];
        const avgScore = this.averageStrategy(scores);
        const minScore = this.leastMisery(scores);
        return {
          movie,
          // Final score: weighted combination of the two group strategies
          score: alpha * avgScore + (1 - alpha) * minScore,
          avgScore,
          minScore,
          likeCount: likeCounts.get(movie.imdbID) ?? 0,
          alpha,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  // Builds a genre weight map for each user.
  // w(user, genre) = (likes - dislikes) / total interactions with that genre.
  // Result is in [-1, 1]: +1 means loved every movie in this genre, -1 means hated them all.
  buildUserProfiles(
    votes: RoomVote[],
    participantIds: string[],
  ): Map<string, Map<string, number>> {
    const profiles = new Map<string, Map<string, number>>();

    for (const userId of participantIds) {
      const userVotes = votes.filter((v) => v.userId === userId);
      const genreLikes = new Map<string, number>();
      const genreDislikes = new Map<string, number>();

      for (const vote of userVotes) {
        const genres = this.parseGenres((vote.movieData as Movie).Genre);
        for (const genre of genres) {
          if (vote.vote === 'like') {
            genreLikes.set(genre, (genreLikes.get(genre) ?? 0) + 1);
          } else {
            genreDislikes.set(genre, (genreDislikes.get(genre) ?? 0) + 1);
          }
        }
      }

      // Normalize: w = (L - D) / (L + D)
      const weights = new Map<string, number>();
      const allGenres = new Set([
        ...genreLikes.keys(),
        ...genreDislikes.keys(),
      ]);
      for (const genre of allGenres) {
        const l = genreLikes.get(genre) ?? 0;
        const d = genreDislikes.get(genre) ?? 0;
        weights.set(genre, (l - d) / (l + d));
      }

      profiles.set(userId, weights);
    }

    return profiles;
  }

  // Content-based score: r(user, movie) = sum of genre weights for genres present in the movie.
  // Returns a Map<movieId, score[]> where score[i] is the score for participantIds[i].
  computeCBFScores(
    movies: Movie[],
    userProfiles: Map<string, Map<string, number>>,
    participantIds: string[],
  ): Map<string, number[]> {
    const scoresByMovie = new Map<string, number[]>();

    for (const movie of movies) {
      const genres = this.parseGenres(movie.Genre);
      const scores = participantIds.map((userId) => {
        const profile = userProfiles.get(userId);
        // No genres or no voting history → neutral score
        if (!profile || genres.length === 0) return 0;
        return genres.reduce((sum, g) => sum + (profile.get(g) ?? 0), 0);
      });
      scoresByMovie.set(movie.imdbID, scores);
    }

    return scoresByMovie;
  }

  // Average Strategy: optimistic — takes the mean across all group members.
  // Works well when preferences are similar.
  averageStrategy(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((s, v) => s + v, 0) / scores.length;
  }

  // Least Misery Strategy: pessimistic — uses the lowest individual score.
  // Ensures no one in the group ends up with a movie they'd hate.
  leastMisery(scores: number[]): number {
    if (scores.length === 0) return 0;
    return Math.min(...scores);
  }

  // Genetic algorithm that finds the optimal α ∈ [0, 1].
  // α = 1 → pure Average Strategy, α = 0 → pure Least Misery.
  // Fitness is evaluated on the top-10 movies by average score to stay focused on relevant candidates.
  geneticAlgorithm(cbfScores: Map<string, number[]>, movies: Movie[]): number {
    const POPULATION_SIZE = 30;
    const GENERATIONS = 50;
    const MUTATION_RATE = 0.1;
    const TOURNAMENT_SIZE = 3;

    // Precompute avg/lm for each movie so fitness() doesn't repeat work
    const precomputed = movies.map((m) => {
      const scores = cbfScores.get(m.imdbID) ?? [];
      return {
        avg: this.averageStrategy(scores),
        lm: this.leastMisery(scores),
      };
    });

    const top10 = [...precomputed].sort((a, b) => b.avg - a.avg).slice(0, 10);

    // Fitness: mean F(movie, α) over top-10 candidates
    const fitness = (alpha: number): number => {
      if (top10.length === 0) return 0;
      return (
        top10.reduce((sum, m) => sum + alpha * m.avg + (1 - alpha) * m.lm, 0) /
        top10.length
      );
    };

    // Random initial population of α values
    let population = Array.from({ length: POPULATION_SIZE }, () =>
      Math.random(),
    );

    for (let gen = 0; gen < GENERATIONS; gen++) {
      const next: number[] = [];
      while (next.length < POPULATION_SIZE) {
        // Select parents via tournament, cross them (arithmetic mean), then mutate
        const p1 = this.tournamentSelect(population, fitness, TOURNAMENT_SIZE);
        const p2 = this.tournamentSelect(population, fitness, TOURNAMENT_SIZE);
        let child = (p1 + p2) / 2;
        if (Math.random() < MUTATION_RATE) {
          child = Math.max(0, Math.min(1, child + (Math.random() * 0.2 - 0.1)));
        }
        next.push(child);
      }
      population = next;
    }

    // Pick the best α from the final generation
    return population.reduce(
      (best, alpha) => (fitness(alpha) > fitness(best) ? alpha : best),
      population[0],
    );
  }

  // Tournament selection: pick `size` random candidates, return the fittest one.
  private tournamentSelect(
    population: number[],
    fitness: (alpha: number) => number,
    size: number,
  ): number {
    const candidates = Array.from(
      { length: size },
      () => population[Math.floor(Math.random() * population.length)],
    );
    return candidates.reduce(
      (best, alpha) => (fitness(alpha) > fitness(best) ? alpha : best),
      candidates[0],
    );
  }

  // Movie.Genre is a comma-separated string like "Action, Drama, Thriller"
  private parseGenres(genreStr: string): string[] {
    if (!genreStr || genreStr === 'N/A') return [];
    return genreStr
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
  }
}
