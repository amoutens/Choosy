/**
 * Benchmark: RecommendationService.recommend()
 *
 * Запуск:
 *   npx ts-node -e "require('./src/rooms/recommendation.benchmark')"
 * або через npm script:
 *   ts-node src/rooms/recommendation.benchmark.ts
 *
 * Виводить таблицю середнього часу виконання (мс) для різних комбінацій
 * кількості фільмів та учасників — у форматі для дипломної роботи.
 */

import { RecommendationService } from './recommendation.service';
import { RoomVote } from './room-vote.entity';
import { Movie } from '../movies/movies.types';


const MOVIE_COUNTS     = [10, 20, 30, 40, 50];
const PARTICIPANT_COUNTS = [2, 5, 10];
const ITERATIONS       = 30;   // кількість повторень для кожної комбінації


const ALL_GENRES = [
  'Action', 'Drama', 'Comedy', 'Horror', 'Thriller',
  'Romance', 'Sci-Fi', 'Adventure', 'Animation', 'Crime',
];

function makeMovie(idx: number): Movie {
  const g1 = ALL_GENRES[idx % ALL_GENRES.length];
  const g2 = ALL_GENRES[(idx + 3) % ALL_GENRES.length];
  return {
    imdbID:     `tt${String(idx + 1).padStart(7, '0')}`,
    Title:      `Movie ${idx + 1}`,
    Year:       String(2000 + (idx % 24)),
    Genre:      `${g1}, ${g2}`,
    Director:   'Test Director',
    Actors:     'Actor A, Actor B',
    Plot:       `Plot for movie ${idx + 1}`,
    Poster:     'N/A',
    imdbRating: String(5 + (idx % 5)),
    Runtime:    `${90 + (idx % 60)} min`,
  } as Movie;
}

function makeVotes(movies: Movie[], participantIds: string[]): RoomVote[] {
  const votes: RoomVote[] = [];
  // Детермінований псевдо-рандом (щоб дані не змінювались між запусками)
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  for (let ui = 0; ui < participantIds.length; ui++) {
    const userId = participantIds[ui];
    for (const movie of movies) {
      if (rand() > 0.25) {   // ~75% фільмів отримують оцінку
        votes.push({
          id:        `${userId}-${movie.imdbID}`,
          roomId:    'bench-room',
          userId,
          movieId:   movie.imdbID,
          vote:      rand() > 0.35 ? 'like' : 'dislike',
          movieData: movie as unknown,
          createdAt: new Date(),
        } as RoomVote);
      }
    }
  }
  return votes;
}


function measure(
  service: RecommendationService,
  movieCount: number,
  participantCount: number,
): number[] {
  const movies       = Array.from({ length: movieCount }, (_, i) => makeMovie(i));
  const participants = Array.from({ length: participantCount }, (_, i) => `user${i + 1}`);
  const votes        = makeVotes(movies, participants);

  const times: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const t0 = performance.now();
    service.recommend(votes, movies, participants);
    times.push(performance.now() - t0);
  }
  return times;
}

function avg(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}


function printTable(results: Map<string, number>): void {
  const COL_W = 18;
  const pad = (s: string | number, w = COL_W) => String(s).padEnd(w);

  const header = [
    pad('Кількість фільмів'),
    ...PARTICIPANT_COUNTS.map(p => pad(`${p} учасн., мс`)),
  ].join(' | ');

  const divider = '-'.repeat(header.length);

  console.log('\n' + divider);
  console.log(header);
  console.log(divider);

  for (const m of MOVIE_COUNTS) {
    const row = [
      pad(m),
      ...PARTICIPANT_COUNTS.map(p => pad(results.get(`${m}-${p}`)!.toFixed(2))),
    ].join(' | ');
    console.log(row);
  }

  console.log(divider);
}


(function run() {
  const service = new RecommendationService();
  const results = new Map<string, number>();

  console.log(
    `\n🔬 Benchmark: RecommendationService.recommend()\n` +
    `   GA: pop=30, gen=50 | Iterations per config: ${ITERATIONS}\n`,
  );

  for (const m of MOVIE_COUNTS) {
    for (const p of PARTICIPANT_COUNTS) {
      process.stdout.write(`  Running movies=${m}, participants=${p} ... `);
      const times = measure(service, m, p);
      const mean  = avg(times);
      results.set(`${m}-${p}`, mean);
      process.stdout.write(`avg = ${mean.toFixed(2)} ms\n`);
    }
  }

  console.log('\n📋 Таблиця результатів (середній час, мс):');
  printTable(results);

  // CSV для вставки в Excel / Excel-діаграму
  console.log('\n📄 CSV:');
  console.log(['movies', ...PARTICIPANT_COUNTS.map(p => `p${p}`)].join(','));
  for (const m of MOVIE_COUNTS) {
    const row = [m, ...PARTICIPANT_COUNTS.map(p => results.get(`${m}-${p}`)!.toFixed(2))];
    console.log(row.join(','));
  }
})();
