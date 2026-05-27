import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Movie } from '../../api/movies.types'
import { Button } from '../ui/Button'

interface ResultsPanelProps {
  likedCount: number
  dislikedCount: number
  likedMovies: Movie[]
  onSwipeAgain: () => void
  onChangeFilters: () => void
  onDashboard: () => void
}

const MovieThumb: FC<{ movie: Movie }> = ({ movie }) => (
  <div className="flex flex-col gap-1.5">
    <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '2/3' }}>
      <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(10,5,25,0.85) 0%, transparent 55%)' }}
      />
      {movie.imdbRating !== 'N/A' && (
        <div
          className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        >
          <span style={{ color: '#facc15', fontSize: 10 }}>★</span>
          <span className="font-poppins font-semibold text-white" style={{ fontSize: 10 }}>
            {movie.imdbRating}
          </span>
        </div>
      )}
    </div>
    <p
      className="font-poppins text-white font-semibold leading-tight"
      style={{ fontSize: 12 }}
      title={movie.Title}
    >
      {movie.Title.length > 18 ? movie.Title.slice(0, 16) + '…' : movie.Title}
    </p>
    <p className="font-poppins" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
      {movie.Year}
    </p>
  </div>
)

export const ResultsPanel: FC<ResultsPanelProps> = ({
  likedCount,
  dislikedCount,
  likedMovies,
  onSwipeAgain,
  onChangeFilters,
  onDashboard,
}) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-6">
      <div
        className="flex gap-8 font-poppins text-[15px]"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        <span style={{ color: '#4ade80' }}>♥ {t('resultsPanel.liked', { count: likedCount })}</span>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>
          ✕ {t('resultsPanel.passed', { count: dislikedCount })}
        </span>
      </div>

      {likedMovies.length > 0 ? (
        <div
          className="w-full rounded-3xl p-5"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <button
            className="w-full flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setExpanded((v) => !v)}
          >
            <p
              className="font-poppins text-[12px] font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {t('resultsPanel.likedMovies')}
            </p>
            <span
              className="font-poppins text-[12px] transition-transform"
              style={{
                color: 'rgba(255,255,255,0.3)',
                display: 'inline-block',
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
            >
              ▾
            </span>
          </button>

          {expanded && (
            <div className="grid grid-cols-3 gap-3">
              {likedMovies.map((movie) => (
                <MovieThumb key={movie.imdbID} movie={movie} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="font-poppins text-[15px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {t('resultsPanel.noLikedMovies')}
        </p>
      )}

      <div className="flex gap-3 flex-wrap justify-center">
        <Button onClick={onSwipeAgain} style={{ paddingLeft: 24, paddingRight: 24 }}>
          {t('resultsPanel.swipeAgain')}
        </Button>
        <Button
          variant="ghost"
          onClick={onChangeFilters}
          style={{ paddingLeft: 24, paddingRight: 24 }}
        >
          {t('resultsPanel.changeFilters')}
        </Button>
        <Button variant="ghost" onClick={onDashboard} style={{ paddingLeft: 24, paddingRight: 24 }}>
          {t('resultsPanel.dashboard')}
        </Button>
      </div>
    </div>
  )
}
