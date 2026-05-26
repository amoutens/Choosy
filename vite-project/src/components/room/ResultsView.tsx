import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Movie } from '../../api/movies.types'
import { RoomState, RoomResults } from '../../api/rooms'

interface SectionToggleProps {
  label: string
  color: string
  open: boolean
  onToggle: () => void
}

const SectionToggle: FC<SectionToggleProps> = ({ label, color, open, onToggle }) => (
  <button className="flex items-center gap-2 w-full mb-3" onClick={onToggle}>
    <p
      className="font-[Poppins] text-[12px] font-semibold uppercase tracking-widest"
      style={{ color }}
    >
      {label}
    </p>
    <span
      className="font-[Poppins] text-[10px] transition-transform"
      style={{ color, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
    >
      ▾
    </span>
  </button>
)

interface MovieResultCardProps {
  movie: Movie
  likeCount: number
  total: number
  score: number
}

const MovieResultCard: FC<MovieResultCardProps> = ({ movie, likeCount, total, score }) => {
  const [showGenres, setShowGenres] = useState(false)
  const genres = movie.Genre !== 'N/A' ? movie.Genre.split(', ') : []
  const isMatch = likeCount === total

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer select-none"
        style={{ aspectRatio: '2/3' }}
        onClick={() => setShowGenres((prev) => !prev)}
      >
        <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,5,25,0.9) 0%, transparent 55%)' }}
        />

        {showGenres && genres.length > 0 && (
          <div
            className="absolute inset-0 flex flex-wrap content-center gap-1 p-2 justify-center"
            style={{ background: 'rgba(10,5,25,0.87)', backdropFilter: 'blur(3px)' }}
          >
            {genres.map((genre) => (
              <span
                key={genre}
                className="font-[Poppins] px-1.5 py-0.5 rounded-md"
                style={{ fontSize: 9, background: 'rgba(206,159,252,0.2)', color: '#CE9FFC' }}
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        <div
          className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg"
          style={{
            background: isMatch ? 'rgba(74,222,128,0.25)' : 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span style={{ color: isMatch ? '#4ade80' : 'rgba(255,255,255,0.5)', fontSize: 9 }}>
            ♥
          </span>
          <span
            className="font-[Poppins] font-semibold"
            style={{ fontSize: 10, color: isMatch ? '#4ade80' : 'rgba(255,255,255,0.7)' }}
          >
            {likeCount}/{total}
          </span>
        </div>

        {movie.imdbRating !== 'N/A' && (
          <div
            className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          >
            <span style={{ color: '#facc15', fontSize: 9 }}>★</span>
            <span className="font-[Poppins] font-semibold text-white" style={{ fontSize: 10 }}>
              {movie.imdbRating}
            </span>
          </div>
        )}
      </div>

      <p
        className="font-[Poppins] text-white font-semibold leading-tight"
        style={{ fontSize: 12 }}
        title={movie.Title}
      >
        {movie.Title.length > 18 ? movie.Title.slice(0, 16) + '…' : movie.Title}
      </p>
      <div className="flex items-center justify-between">
        <p className="font-[Poppins]" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          {movie.Year}
        </p>
        <p
          className="font-[Poppins] font-semibold"
          style={{ fontSize: 10, color: score > 0 ? '#CE9FFC' : 'rgba(255,255,255,0.25)' }}
        >
          {score > 0 ? '+' : ''}
          {score.toFixed(2)}
        </p>
      </div>
    </div>
  )
}

export interface ResultsViewProps {
  results: RoomResults
  participants: RoomState['participants']
  onDashboard: () => void
}

export const ResultsView: FC<ResultsViewProps> = ({ results, participants, onDashboard }) => {
  const { t } = useTranslation()
  const total = participants.length
  const alpha = results.movies[0]?.alpha ?? 1
  const likedMovies = results.movies.filter((result) => result.likeCount > 0)
  const everyoneLiked = likedMovies.filter((result) => result.likeCount === total)
  const someLiked = likedMovies.filter((result) => result.likeCount < total)
  const [showEveryoneLiked, setShowEveryoneLiked] = useState(true)
  const [showSomeLiked, setShowSomeLiked] = useState(true)

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 font-[Poppins] text-[13px]">
        <span style={{ color: '#4ade80' }}>
          ★ {t('results.everyoneLiked', { count: everyoneLiked.length })}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('results.picks', { count: likedMovies.length })}
        </span>
        <span
          className="px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(206,159,252,0.12)', color: '#CE9FFC' }}
          title={t('results.algorithmBalance')}
        >
          α = {alpha.toFixed(2)}
        </span>
      </div>

      {likedMovies.length === 0 ? (
        <p className="font-[Poppins] text-[15px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('results.noLikes')}
        </p>
      ) : (
        <div
          className="w-full rounded-3xl p-5 flex flex-col gap-4"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {everyoneLiked.length > 0 && (
            <div>
              <SectionToggle
                label={t('results.sectionEveryoneLiked')}
                color="#4ade80"
                open={showEveryoneLiked}
                onToggle={() => setShowEveryoneLiked((prev) => !prev)}
              />
              {showEveryoneLiked && (
                <div className="grid grid-cols-3 gap-3">
                  {everyoneLiked.map(({ movie, likeCount, score }) => (
                    <MovieResultCard
                      key={movie.imdbID}
                      movie={movie}
                      likeCount={likeCount}
                      total={total}
                      score={score}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {someLiked.length > 0 && (
            <div>
              <SectionToggle
                label={t('results.sectionAlsoLiked')}
                color="rgba(255,255,255,0.35)"
                open={showSomeLiked}
                onToggle={() => setShowSomeLiked((prev) => !prev)}
              />
              {showSomeLiked && (
                <div className="grid grid-cols-3 gap-3">
                  {someLiked.map(({ movie, likeCount, score }) => (
                    <MovieResultCard
                      key={movie.imdbID}
                      movie={movie}
                      likeCount={likeCount}
                      total={total}
                      score={score}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Button onClick={onDashboard} style={{ paddingLeft: 32, paddingRight: 32 }}>
        {t('results.backToDashboard')}
      </Button>
    </div>
  )
}
