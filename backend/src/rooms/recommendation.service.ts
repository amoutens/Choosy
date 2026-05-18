import { Injectable } from '@nestjs/common';
import { RoomVote } from './room-vote.entity';
import { Movie } from '../movies/movies.types';
import { RecommendedResult } from './rooms.types';

// Per-movie cache used inside the genetic algorithm
interface ScoredMovie {
  perUserScores: number[];
  avgScore: number;
  minScore: number;
}

@Injectable()
export class RecommendationService {
  private readonly POPULATION_SIZE = 30;
  private readonly GENERATIONS = 50;
  private readonly MUTATION_RATE = 0.1;
  private readonly TOURNAMENT_SIZE = 3;

  // Entry point: scores all candidate movies for the group and sorts best-first.
  recommend(
    votes: RoomVote[],
    candidateMovies: Movie[],
    participantIds: string[],
  ): RecommendedResult[] {
    if (candidateMovies.length === 0 || participantIds.length === 0) return [];

    // Genre preference profile per user: genre → weight in [−1, 1]
    const userProfiles = this.buildUserProfiles(votes, participantIds);

    // Content-based score per movie per user
    const contentScores = this.computeContentScores(
      candidateMovies,
      userProfiles,
      participantIds,
    );

    // Solo session → no group conflict, pure Average Strategy is optimal (α = 1)
    const alpha =
      participantIds.length <= 1
        ? 1.0
        : this.findOptimalAlpha(contentScores, candidateMovies);

    const likeCountByMovie = this.countLikesPerMovie(votes);

    return candidateMovies
      .map((movie) => {
        const scores = contentScores.get(movie.imdbID) ?? [];
        const avgScore = this.averageStrategy(scores);
        const minScore = this.leastMiseryStrategy(scores);
        return {
          movie,
          score: alpha * avgScore + (1 - alpha) * minScore,
          avgScore,
          minScore,
          likeCount: likeCountByMovie.get(movie.imdbID) ?? 0,
          alpha,
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  // Builds a genre weight map for each user.
  // weight(user, genre) = (likes − dislikes) / (likes + dislikes)
  // Result is in [−1, 1]: +1 means loved every movie in this genre, −1 means hated all.
  buildUserProfiles(
    votes: RoomVote[],
    participantIds: string[],
  ): Map<string, Map<string, number>> {
    const profiles = new Map<string, Map<string, number>>();

    for (const userId of participantIds) {
      const genreTally = new Map<string, { likes: number; dislikes: number }>();

      for (const vote of votes.filter((v) => v.userId === userId)) {
        for (const genre of this.parseGenres((vote.movieData as Movie).Genre)) {
          const tally = genreTally.get(genre) ?? { likes: 0, dislikes: 0 };
          if (vote.vote === 'like') tally.likes++;
          else tally.dislikes++;
          genreTally.set(genre, tally);
        }
      }

      const genreWeights = new Map<string, number>();
      for (const [genre, { likes, dislikes }] of genreTally) {
        genreWeights.set(genre, (likes - dislikes) / (likes + dislikes));
      }

      profiles.set(userId, genreWeights);
    }

    return profiles;
  }

  // Content-based score: score(user, movie) = sum of the user's genre weights
  // for all genres that appear in the movie.
  // Returns movieId → [score for participant 0, score for participant 1, ...]
  computeContentScores(
    movies: Movie[],
    userProfiles: Map<string, Map<string, number>>,
    participantIds: string[],
  ): Map<string, number[]> {
    const scoresByMovie = new Map<string, number[]>();

    for (const movie of movies) {
      const genres = this.parseGenres(movie.Genre);
      const perUserScores = participantIds.map((userId) => {
        const profile = userProfiles.get(userId);
        if (!profile || genres.length === 0) return 0;
        return genres.reduce(
          (total, genre) => total + (profile.get(genre) ?? 0),
          0,
        );
      });
      scoresByMovie.set(movie.imdbID, perUserScores);
    }

    return scoresByMovie;
  }

  // Average Strategy: mean score across all group members.
  // Optimistic — good when the group has similar tastes.
  averageStrategy(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((total, score) => total + score, 0) / scores.length;
  }

  // Least Misery Strategy: the lowest individual score in the group.
  // Pessimistic — prevents anyone from getting a movie they would strongly dislike.
  leastMiseryStrategy(scores: number[]): number {
    if (scores.length === 0) return 0;
    return Math.min(...scores);
  }

  // Genetic algorithm that finds the optimal blending weight α ∈ [0, 1].
  // α = 1 → pure Average Strategy (optimistic), α = 0 → pure Least Misery (pessimistic).
  //
  // Key insight: α changes WHICH movies land in the top-10, not just their order.
  // A polarizing film (high average, very negative minimum) is pushed down under low α,
  // replaced by a consensus pick. The fitness therefore re-ranks the whole list for
  // each α candidate, measures per-user satisfaction over that specific top-10,
  // and penalizes variance (unfairness across group members).
  private findOptimalAlpha(
    contentScores: Map<string, number[]>,
    movies: Movie[],
  ): number {
    const scoredMovies: ScoredMovie[] = movies.map((movie) => {
      const perUserScores = contentScores.get(movie.imdbID) ?? [];
      return {
        perUserScores,
        avgScore: this.averageStrategy(perUserScores),
        minScore: this.leastMiseryStrategy(perUserScores),
      };
    });

    const userCount = scoredMovies[0]?.perUserScores.length ?? 0;

    const fitness = (alpha: number) =>
      this.evaluateFitness(scoredMovies, userCount, alpha);

    // Deterministic seed → same votes always produce the same α, no page-refresh flicker
    const rand = this.mulberry32(this.computeSeed(contentScores));

    let population: number[] = Array.from(
      { length: this.POPULATION_SIZE },
      () => rand(),
    );

    for (let generation = 0; generation < this.GENERATIONS; generation++) {
      const nextGeneration: number[] = [];
      while (nextGeneration.length < this.POPULATION_SIZE) {
        const parent1 = this.tournamentSelect(
          population,
          fitness,
          this.TOURNAMENT_SIZE,
          rand,
        );
        const parent2 = this.tournamentSelect(
          population,
          fitness,
          this.TOURNAMENT_SIZE,
          rand,
        );
        // Arithmetic crossover: child is the midpoint of the two parents
        let child = (parent1 + parent2) / 2;
        // Random nudge to escape local optima
        if (rand() < this.MUTATION_RATE) {
          child = Math.max(0, Math.min(1, child + (rand() * 0.2 - 0.1)));
        }
        nextGeneration.push(child);
      }
      population = nextGeneration;
    }

    return population.reduce(
      (best, alpha) => (fitness(alpha) > fitness(best) ? alpha : best),
      population[0],
    );
  }

  // Fitness = mean group satisfaction − variance.
  // Re-ranks movies for the given α so the top-10 reflects actual recommendation output.
  // Subtracting variance rewards lists where every user is equally satisfied (fairness).
  private evaluateFitness(
    scoredMovies: ScoredMovie[],
    userCount: number,
    alpha: number,
  ): number {
    const top10 = [...scoredMovies]
      .sort(
        (a, b) =>
          b.avgScore * alpha +
          b.minScore * (1 - alpha) -
          (a.avgScore * alpha + a.minScore * (1 - alpha)),
      )
      .slice(0, 10);

    if (top10.length === 0 || userCount === 0) return 0;

    const userSatisfactions = Array.from(
      { length: userCount },
      (_, userIndex) =>
        top10.reduce(
          (total, movie) => total + (movie.perUserScores[userIndex] ?? 0),
          0,
        ) / top10.length,
    );

    const mean =
      userSatisfactions.reduce((total, sat) => total + sat, 0) / userCount;
    const variance =
      userSatisfactions.reduce((total, sat) => total + (sat - mean) ** 2, 0) /
      userCount;

    return mean - variance;
  }

  // Tournament selection: pick `size` random candidates, return the fittest.
  private tournamentSelect(
    population: number[],
    fitness: (alpha: number) => number,
    size: number,
    rand: () => number = Math.random,
  ): number {
    const candidates = Array.from(
      { length: size },
      () => population[Math.floor(rand() * population.length)],
    );
    return candidates.reduce(
      (best, alpha) => (fitness(alpha) > fitness(best) ? alpha : best),
      candidates[0],
    );
  }

  // Hashes the content scores into a single integer so the GA always starts
  // from the same initial population for the same set of votes.
  private computeSeed(contentScores: Map<string, number[]>): number {
    let seed = 0;
    for (const [movieId, scores] of contentScores.entries()) {
      for (let charIndex = 0; charIndex < movieId.length; charIndex++) {
        seed = (seed * 31 + movieId.charCodeAt(charIndex)) | 0;
      }
      for (const score of scores) {
        seed = (seed * 31 + Math.round(score * 10000)) | 0;
      }
    }
    return Math.abs(seed) || 1;
  }

  // Mulberry32 — a fast seeded pseudo-random number generator.
  // The same seed always produces the same sequence of numbers in [0, 1).
  private mulberry32(seed: number): () => number {
    let state = seed;
    return (): number => {
      state = (state + 0x6d2b79f5) | 0;
      let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
      mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
      return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Movie.Genre is a comma-separated string like "Action, Drama, Thriller"
  private parseGenres(genreStr: string): string[] {
    if (!genreStr || genreStr === 'N/A') return [];
    return genreStr
      .split(',')
      .map((genre) => genre.trim())
      .filter(Boolean);
  }

  private countLikesPerMovie(votes: RoomVote[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const vote of votes) {
      if (vote.vote === 'like') {
        counts.set(vote.movieId, (counts.get(vote.movieId) ?? 0) + 1);
      }
    }
    return counts;
  }
}
