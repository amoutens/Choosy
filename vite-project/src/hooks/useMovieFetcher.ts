import { useCallback, useRef, useState } from 'react'
import { fetchMovies } from '../api/movies'
import { Movie, MovieFilters } from '../api/movies.types'

const FETCH_MORE_THRESHOLD = 5

export function useMovieFetcher() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [noMoreMovies, setNoMoreMovies] = useState(false)

  const currentFiltersRef = useRef<MovieFilters>({})
  const nextPageTokenRef = useRef<string | null>(null)
  const isFetchingMoreRef = useRef(false)
  const movieCacheRef = useRef<Map<string, Movie>>(new Map())
  const sortIndexRef = useRef(0)
  const emptyFetchCountRef = useRef(0)

  const fetchMore = useCallback(async () => {
    if (isFetchingMoreRef.current) return
    isFetchingMoreRef.current = true
    setIsFetchingMore(true)
    try {
      const filters = { ...currentFiltersRef.current, sortIndex: sortIndexRef.current++ }
      const result = await fetchMovies(filters, nextPageTokenRef.current ?? undefined)
      const newMovies = result.movies.filter((m) => !movieCacheRef.current.has(m.imdbID))
      newMovies.forEach((m) => movieCacheRef.current.set(m.imdbID, m))
      setMovies((prev) => [...prev, ...newMovies])
      nextPageTokenRef.current = result.nextPageToken
      if (newMovies.length === 0) {
        emptyFetchCountRef.current += 1
        if (emptyFetchCountRef.current >= 3) setNoMoreMovies(true)
      } else {
        emptyFetchCountRef.current = 0
      }
    } catch {
      // silent — user still has existing cards
    } finally {
      isFetchingMoreRef.current = false
      setIsFetchingMore(false)
    }
  }, [])

  const needsMore = (phase: string) =>
    phase === 'swiping' && !isFetchingMore && !noMoreMovies && movies.length <= FETCH_MORE_THRESHOLD

  const resetSession = (filters: MovieFilters) => {
    currentFiltersRef.current = filters
    nextPageTokenRef.current = null
    movieCacheRef.current.clear()
    sortIndexRef.current = 0
    emptyFetchCountRef.current = 0
    setNoMoreMovies(false)
    setMovies([])
  }

  const getCached = (id: string) => movieCacheRef.current.get(id)

  return {
    movies,
    setMovies,
    isFetchingMore,
    noMoreMovies,
    fetchMore,
    needsMore,
    resetSession,
    getCached,
  }
}
