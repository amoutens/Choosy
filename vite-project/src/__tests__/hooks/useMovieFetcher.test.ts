import { renderHook, act } from '@testing-library/react'
import { useMovieFetcher } from '../../hooks/useMovieFetcher'

jest.mock('../../api/movies', () => ({
  fetchMovies: jest.fn(),
}))

import { fetchMovies } from '../../api/movies'
const mockFetchMovies = fetchMovies as jest.Mock

const makeMovie = (id: string) => ({
  imdbID: id,
  Title: `Movie ${id}`,
  Year: '2021',
  Genre: 'Drama',
  Director: 'N/A',
  Actors: 'N/A',
  Plot: 'Some plot.',
  Poster: 'https://example.com/poster.jpg',
  imdbRating: '7.5',
  Runtime: '100 min',
})

describe('useMovieFetcher', () => {
  beforeEach(() => {
    mockFetchMovies.mockReset()
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useMovieFetcher())
    expect(result.current.movies).toEqual([])
    expect(result.current.isFetchingMore).toBe(false)
    expect(result.current.noMoreMovies).toBe(false)
  })

  it('needsMore returns false outside swiping phase', () => {
    const { result } = renderHook(() => useMovieFetcher())
    expect(result.current.needsMore('filter')).toBe(false)
    expect(result.current.needsMore('results')).toBe(false)
  })

  it('needsMore returns true in swiping phase when queue is short', () => {
    const { result } = renderHook(() => useMovieFetcher())
    expect(result.current.needsMore('swiping')).toBe(true)
  })

  it('needsMore returns false in swiping phase when noMoreMovies is true', async () => {
    mockFetchMovies.mockResolvedValue({ movies: [], nextPageToken: null })
    const { result } = renderHook(() => useMovieFetcher())

    await act(async () => {
      await result.current.fetchMore()
    })
    await act(async () => {
      await result.current.fetchMore()
    })
    await act(async () => {
      await result.current.fetchMore()
    })

    expect(result.current.noMoreMovies).toBe(true)
    expect(result.current.needsMore('swiping')).toBe(false)
  })

  it('fetchMore adds movies to the list', async () => {
    const movie = makeMovie('tt001')
    mockFetchMovies.mockResolvedValueOnce({ movies: [movie], nextPageToken: null })

    const { result } = renderHook(() => useMovieFetcher())

    await act(async () => {
      await result.current.fetchMore()
    })

    expect(result.current.movies).toHaveLength(1)
    expect(result.current.movies[0].imdbID).toBe('tt001')
  })

  it('getCached returns a movie fetched earlier', async () => {
    const movie = makeMovie('tt001')
    mockFetchMovies.mockResolvedValueOnce({ movies: [movie], nextPageToken: null })

    const { result } = renderHook(() => useMovieFetcher())

    await act(async () => {
      await result.current.fetchMore()
    })

    expect(result.current.getCached('tt001')).toEqual(movie)
  })

  it('deduplicates movies returned in multiple fetches', async () => {
    const m1 = makeMovie('tt001')
    const m2 = makeMovie('tt002')
    mockFetchMovies
      .mockResolvedValueOnce({ movies: [m1], nextPageToken: 'page2' })
      .mockResolvedValueOnce({ movies: [m1, m2], nextPageToken: null })

    const { result } = renderHook(() => useMovieFetcher())

    await act(async () => {
      await result.current.fetchMore()
    })
    await act(async () => {
      await result.current.fetchMore()
    })

    const ids = result.current.movies.map((m) => m.imdbID)
    expect(ids).toEqual(expect.arrayContaining(['tt001', 'tt002']))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('sets noMoreMovies after 3 consecutive empty fetches', async () => {
    mockFetchMovies.mockResolvedValue({ movies: [], nextPageToken: null })
    const { result } = renderHook(() => useMovieFetcher())

    await act(async () => {
      await result.current.fetchMore()
    })
    expect(result.current.noMoreMovies).toBe(false)

    await act(async () => {
      await result.current.fetchMore()
    })
    expect(result.current.noMoreMovies).toBe(false)

    await act(async () => {
      await result.current.fetchMore()
    })
    expect(result.current.noMoreMovies).toBe(true)
  })

  it('resets empty fetch counter when movies are found', async () => {
    const movie = makeMovie('tt001')
    mockFetchMovies
      .mockResolvedValueOnce({ movies: [], nextPageToken: null })
      .mockResolvedValueOnce({ movies: [], nextPageToken: null })
      .mockResolvedValueOnce({ movies: [movie], nextPageToken: null })
      .mockResolvedValueOnce({ movies: [], nextPageToken: null })
      .mockResolvedValueOnce({ movies: [], nextPageToken: null })

    const { result } = renderHook(() => useMovieFetcher())

    await act(async () => {
      await result.current.fetchMore()
    })
    await act(async () => {
      await result.current.fetchMore()
    })
    await act(async () => {
      await result.current.fetchMore()
    })
    await act(async () => {
      await result.current.fetchMore()
    })
    await act(async () => {
      await result.current.fetchMore()
    })

    expect(result.current.noMoreMovies).toBe(false)
  })

  it('resetSession clears movies and resets flags', async () => {
    mockFetchMovies.mockResolvedValueOnce({ movies: [makeMovie('tt001')], nextPageToken: null })
    const { result } = renderHook(() => useMovieFetcher())

    await act(async () => {
      await result.current.fetchMore()
    })
    expect(result.current.movies).toHaveLength(1)

    act(() => {
      result.current.resetSession({ types: ['MOVIE'] })
    })

    expect(result.current.movies).toHaveLength(0)
    expect(result.current.noMoreMovies).toBe(false)
  })

  it('resetSession clears the movie cache', async () => {
    const movie = makeMovie('tt001')
    mockFetchMovies
      .mockResolvedValueOnce({ movies: [movie], nextPageToken: null })
      .mockResolvedValueOnce({ movies: [movie], nextPageToken: null })

    const { result } = renderHook(() => useMovieFetcher())

    await act(async () => {
      await result.current.fetchMore()
    })

    act(() => {
      result.current.resetSession({})
    })

    await act(async () => {
      await result.current.fetchMore()
    })

    expect(result.current.movies).toHaveLength(1)
  })
})
