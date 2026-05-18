import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';

const makeTitle = (id = 'tt001', overrides: Record<string, unknown> = {}) => ({
  id,
  primaryTitle: 'Test Movie',
  startYear: 2020,
  genres: ['Action', 'Drama'],
  plot: 'A great film.',
  primaryImage: { url: 'https://example.com/img.jpg' },
  rating: { aggregateRating: 7.5 },
  runtimeSeconds: 7200,
  ...overrides,
});

const mockFetch = (body: unknown, ok = true) => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(body),
  });
};

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesService],
    }).compile();
    service = module.get<MoviesService>(MoviesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getMovies', () => {
    it('returns mapped movies on success', async () => {
      mockFetch({ titles: [makeTitle()], nextPageToken: null });
      const result = await service.getMovies({});
      expect(result.movies).toHaveLength(1);
      expect(result.movies[0].imdbID).toBe('tt001');
      expect(result.movies[0].Title).toBe('Test Movie');
      expect(result.movies[0].Genre).toBe('Action, Drama');
      expect(result.movies[0].Runtime).toBe('120 min');
      expect(result.movies[0].imdbRating).toBe('7.5');
    });

    it('returns empty list and null token when response is not ok', async () => {
      mockFetch({}, false);
      const result = await service.getMovies({});
      expect(result.movies).toEqual([]);
      expect(result.nextPageToken).toBeNull();
    });

    it('returns empty list on fetch error', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('network error'));
      const result = await service.getMovies({});
      expect(result.movies).toEqual([]);
      expect(result.nextPageToken).toBeNull();
    });

    it('filters out titles without primaryImage', async () => {
      mockFetch({
        titles: [
          makeTitle('tt001'),
          makeTitle('tt002', { primaryImage: null }),
        ],
        nextPageToken: null,
      });
      const result = await service.getMovies({});
      expect(result.movies).toHaveLength(1);
      expect(result.movies[0].imdbID).toBe('tt001');
    });

    it('forwards nextPageToken from the API response', async () => {
      mockFetch({ titles: [], nextPageToken: 'abc123' });
      const result = await service.getMovies({});
      expect(result.nextPageToken).toBe('abc123');
    });

    it('returns null nextPageToken when API omits it', async () => {
      mockFetch({ titles: [] });
      const result = await service.getMovies({});
      expect(result.nextPageToken).toBeNull();
    });

    it('maps missing rating, year, and runtime to N/A', async () => {
      mockFetch({
        titles: [
          makeTitle('tt001', {
            rating: null,
            startYear: null,
            runtimeSeconds: null,
          }),
        ],
        nextPageToken: null,
      });
      const result = await service.getMovies({});
      const m = result.movies[0];
      expect(m.imdbRating).toBe('N/A');
      expect(m.Year).toBe('N/A');
      expect(m.Runtime).toBe('N/A');
    });

    it('maps missing genres to N/A', async () => {
      mockFetch({
        titles: [makeTitle('tt001', { genres: [] })],
        nextPageToken: null,
      });
      const result = await service.getMovies({});
      expect(result.movies[0].Genre).toBe('N/A');
    });

    it('maps missing plot to N/A', async () => {
      mockFetch({
        titles: [makeTitle('tt001', { plot: null })],
        nextPageToken: null,
      });
      const result = await service.getMovies({});
      expect(result.movies[0].Plot).toBe('N/A');
    });
  });

  describe('buildParams — type defaults', () => {
    it('uses MOVIE type by default when none specified', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({});
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('types=MOVIE');
    });

    it('uses provided types instead of default', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ types: ['TV_SERIES'] });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('types=TV_SERIES');
      expect(url).not.toContain('types=MOVIE');
    });

    it('appends multiple types', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ types: ['MOVIE', 'TV_MOVIE'] });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('types=MOVIE');
      expect(url).toContain('types=TV_MOVIE');
    });
  });

  describe('buildParams — minVoteCount tiers', () => {
    it('sets minVoteCount to 50000 for minRating >= 8', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ minRating: 8 });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('minVoteCount=50000');
    });

    it('sets minVoteCount to 5000 for minRating >= 6', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ minRating: 6 });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('minVoteCount=5000');
    });

    it('sets minVoteCount to 100 for minRating < 6', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ minRating: 3 });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('minVoteCount=100');
    });

    it('sets minVoteCount to 1000 when no minRating provided', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({});
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('minVoteCount=1000');
    });
  });

  describe('buildParams — year and rating filters', () => {
    it('includes startYear and endYear', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ startYear: 2000, endYear: 2010 });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('startYear=2000');
      expect(url).toContain('endYear=2010');
    });

    it('includes minAggregateRating when minRating is set', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ minRating: 7 });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('minAggregateRating=7');
    });

    it('includes maxAggregateRating when maxRating is set', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ maxRating: 9 });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('maxAggregateRating=9');
    });

    it('includes genres', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ genres: ['Horror', 'Thriller'] });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('genres=Horror');
      expect(url).toContain('genres=Thriller');
    });

    it('includes pageToken when provided', async () => {
      mockFetch({ titles: [], nextPageToken: null });
      await service.getMovies({ pageToken: 'tok123' });
      const url = ((global.fetch as jest.Mock).mock.calls as string[][])[0][0];
      expect(url).toContain('pageToken=tok123');
    });
  });
});
