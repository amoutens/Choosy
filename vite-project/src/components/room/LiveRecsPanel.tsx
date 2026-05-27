import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Movie } from '../../api/movies.types'
import { MovieRanking } from '../../hooks/useRoomSocket'

interface Props {
  rankings: MovieRanking[]
  allMovies: Movie[]
}

export const LiveRecsPanel: FC<Props> = ({ rankings, allMovies }) => {
  const { t } = useTranslation()
  const movieMap = new Map(allMovies.map((movie) => [movie.imdbID, movie]))
  const top5 = rankings
    .slice(0, 5)
    .map((ranking) => ({ ...ranking, movie: movieMap.get(ranking.imdbID) }))
    .filter((ranking): ranking is typeof ranking & { movie: Movie } => ranking.movie !== undefined)

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      <p
        className="font-poppins text-[11px] uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        {t('liveRecs.groupTopPicks')}
      </p>
      <div className="flex gap-2 justify-center">
        {top5.map((ranking, index) => (
          <div key={ranking.imdbID} className="relative flex-shrink-0">
            <img
              src={ranking.movie.Poster}
              alt={ranking.movie.Title}
              className="rounded-xl object-cover"
              style={{ width: 48, height: 72 }}
            />
            <div
              className="absolute top-1 left-1 font-poppins font-bold rounded-md px-1"
              style={{
                fontSize: 9,
                background: 'rgba(0,0,0,0.65)',
                color: index === 0 ? '#CE9FFC' : 'rgba(255,255,255,0.6)',
              }}
            >
              #{index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
