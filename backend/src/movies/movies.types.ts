export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Genre: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  Runtime: string;
}

export interface MoviesResult {
  movies: Movie[];
  nextPageToken: string | null;
}

export interface MovieFilters {
  types?: string[];
  genres?: string[];
  minRating?: number;
  maxRating?: number;
  startYear?: number;
  endYear?: number;
  pageToken?: string;
  sortIndex?: number;
}

export interface ImdbTitle {
  id: string;
  primaryTitle: string;
  primaryImage?: { url: string };
  startYear?: number;
  genres?: string[];
  rating?: { aggregateRating: number; voteCount: number };
  runtimeSeconds?: number;
  plot?: string;
}

export interface ImdbResponse {
  titles?: ImdbTitle[];
  nextPageToken?: string;
}
