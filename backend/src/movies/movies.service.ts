import { Injectable } from '@nestjs/common';
import {
  ImdbResponse,
  ImdbTitle,
  Movie,
  MovieFilters,
  MoviesResult,
} from './movies.types';

const IMDB_API_BASE = 'https://api.imdbapi.dev';

const SORT_OPTIONS = [
  'SORT_BY_POPULARITY',
  'SORT_BY_USER_RATING',
  'SORT_BY_USER_RATING_COUNT',
] as const;

@Injectable()
export class MoviesService {
  async getMovies(filters: MovieFilters): Promise<MoviesResult> {
    const url = `${IMDB_API_BASE}/titles?${this.buildParams(filters)}`;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url);
        if (res.status === 429) {
          if (attempt < 2) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1500 * (attempt + 1)),
            );
            continue;
          }
          return { movies: [], nextPageToken: null };
        }
        if (!res.ok) return { movies: [], nextPageToken: null };

        const data = (await res.json()) as ImdbResponse;
        const movies = this.shuffle(
          (data.titles ?? [])
            .filter((t) => Boolean(t.primaryImage?.url))
            .map((t) => this.mapTitle(t)),
        );
        return { movies, nextPageToken: data.nextPageToken ?? null };
      } catch {
        return { movies: [], nextPageToken: null };
      }
    }
    return { movies: [], nextPageToken: null };
  }

  private buildParams(filters: MovieFilters): URLSearchParams {
    const p = new URLSearchParams();

    (filters.types?.length ? filters.types : ['MOVIE']).forEach((t) =>
      p.append('types', t),
    );
    p.set('sortBy', SORT_OPTIONS[this.pickSortIdx(filters.sortIndex)]);

    filters.genres?.forEach((g) => p.append('genres', g));

    p.set(
      'minVoteCount',
      filters.minRating ? this.minVoteCount(filters.minRating) : '1000',
    );
    if (filters.minRating)
      p.set('minAggregateRating', String(filters.minRating));
    if (filters.maxRating)
      p.set('maxAggregateRating', String(filters.maxRating));
    if (filters.startYear) p.set('startYear', String(filters.startYear));
    if (filters.endYear) p.set('endYear', String(filters.endYear));
    if (filters.pageToken) p.set('pageToken', filters.pageToken);

    return p;
  }

  private pickSortIdx(sortIndex?: number): number {
    return typeof sortIndex === 'number'
      ? sortIndex % SORT_OPTIONS.length
      : Math.floor(Math.random() * SORT_OPTIONS.length);
  }

  private mapTitle(t: ImdbTitle): Movie {
    return {
      imdbID: t.id,
      Title: t.primaryTitle,
      Year: t.startYear ? String(t.startYear) : 'N/A',
      Genre: (t.genres ?? []).join(', ') || 'N/A',
      Director: 'N/A',
      Actors: 'N/A',
      Plot: t.plot ?? 'N/A',
      Poster: t.primaryImage!.url,
      imdbRating: t.rating ? String(t.rating.aggregateRating) : 'N/A',
      Runtime: t.runtimeSeconds
        ? `${Math.round(t.runtimeSeconds / 60)} min`
        : 'N/A',
    };
  }

  private minVoteCount(rating: number): string {
    if (rating >= 8) return '50000';
    if (rating >= 6) return '5000';
    return '100';
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
