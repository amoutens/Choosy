export interface Movie {
  imdbID: string
  Title: string
  Year: string
  Genre: string
  Director: string
  Actors: string
  Plot: string
  Poster: string
  imdbRating: string
  Runtime: string
}

export interface MovieFilters {
  types?: string[]
  genres?: string[]
  minRating?: number
  maxRating?: number
  startYear?: number
  endYear?: number
  sortIndex?: number
}

export interface MoviesResponse {
  movies: Movie[]
  nextPageToken: string | null
}
