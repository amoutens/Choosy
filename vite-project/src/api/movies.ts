import { API_BASE } from '../lib/constants'
import { MovieFilters, MoviesResponse } from './movies.types'

export type { Movie, MovieFilters, MoviesResponse } from './movies.types'

export async function fetchMovies(
  filters: MovieFilters = {},
  pageToken?: string,
): Promise<MoviesResponse> {
  const token = localStorage.getItem('token')
  const params = new URLSearchParams()

  filters.types?.forEach((t) => params.append('types', t))
  filters.genres?.forEach((g) => params.append('genres', g))
  if (filters.minRating !== undefined) params.set('minRating', String(filters.minRating))
  if (filters.maxRating !== undefined) params.set('maxRating', String(filters.maxRating))
  if (filters.startYear) params.set('startYear', String(filters.startYear))
  if (filters.endYear) params.set('endYear', String(filters.endYear))
  if (filters.sortIndex !== undefined) params.set('sortIndex', String(filters.sortIndex))
  if (pageToken) params.set('pageToken', pageToken)

  const res = await fetch(`${API_BASE}/movies?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to load movies')
  return res.json() as Promise<MoviesResponse>
}
