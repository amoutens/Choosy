import { fetchMovies } from '../../api/movies'

const mockFetch = (body: unknown, ok = true) => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(body),
  } as Response)
}

const successResponse = {
  movies: [
    {
      imdbID: 'tt0111161',
      Title: 'The Shawshank Redemption',
      Year: '1994',
      Genre: 'Drama',
      Director: 'N/A',
      Actors: 'N/A',
      Plot: 'Two imprisoned men bond.',
      Poster: 'https://example.com/poster.jpg',
      imdbRating: '9.3',
      Runtime: '142 min',
    },
  ],
  nextPageToken: null,
}

describe('fetchMovies', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-jwt')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('returns the parsed response on success', async () => {
    mockFetch(successResponse)
    const result = await fetchMovies()
    expect(result).toEqual(successResponse)
  })

  it('sends Authorization header with the stored token', async () => {
    mockFetch(successResponse)
    await fetchMovies()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/movies'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-jwt' },
      }),
    )
  })

  it('appends multiple type values to URL', async () => {
    mockFetch(successResponse)
    await fetchMovies({ types: ['MOVIE', 'TV_SERIES'] })
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).toContain('types=MOVIE')
    expect(url).toContain('types=TV_SERIES')
  })

  it('appends multiple genre values to URL', async () => {
    mockFetch(successResponse)
    await fetchMovies({ genres: ['Action', 'Comedy'] })
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).toContain('genres=Action')
    expect(url).toContain('genres=Comedy')
  })

  it('appends minRating and maxRating to URL', async () => {
    mockFetch(successResponse)
    await fetchMovies({ minRating: 6.5, maxRating: 9 })
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).toContain('minRating=6.5')
    expect(url).toContain('maxRating=9')
  })

  it('appends startYear and endYear to URL', async () => {
    mockFetch(successResponse)
    await fetchMovies({ startYear: 2000, endYear: 2020 })
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).toContain('startYear=2000')
    expect(url).toContain('endYear=2020')
  })

  it('appends sortIndex to URL', async () => {
    mockFetch(successResponse)
    await fetchMovies({ sortIndex: 2 })
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).toContain('sortIndex=2')
  })

  it('appends pageToken when provided', async () => {
    mockFetch(successResponse)
    await fetchMovies({}, 'nextPage42')
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).toContain('pageToken=nextPage42')
  })

  it('does not include rating params when not specified', async () => {
    mockFetch(successResponse)
    await fetchMovies({})
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).not.toContain('minRating')
    expect(url).not.toContain('maxRating')
  })

  it('does not include year params when not specified', async () => {
    mockFetch(successResponse)
    await fetchMovies({})
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).not.toContain('startYear')
    expect(url).not.toContain('endYear')
  })

  it('throws on non-ok response', async () => {
    mockFetch({}, false)
    await expect(fetchMovies()).rejects.toThrow('Failed to load movies')
  })

  it('includes minRating=0 in URL when explicitly set to 0', async () => {
    mockFetch(successResponse)
    await fetchMovies({ minRating: 0 })
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
    expect(url).toContain('minRating=0')
  })
})
