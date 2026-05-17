import { FC, useState } from 'react'
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
    <p className="font-[Poppins]" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
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
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-6">
      <div
        className="flex gap-8 font-[Poppins] text-[15px]"
        style={{ color: 'rgba(255,255,255,0.6)' }}
      >
        <span style={{ color: '#4ade80' }}>♥ {likedCount} liked</span>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>✕ {dislikedCount} passed</span>
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
            className="w-full flex items-center justify-between mb-4"
            onClick={() => setExpanded((v) => !v)}
          >
            <p
              className="font-[Poppins] text-[12px] font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              Liked movies
            </p>
            <span
              className="font-[Poppins] text-[12px] transition-transform"
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
              {likedMovies.map((m) => (
                <MovieThumb key={m.imdbID} movie={m} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="font-[Poppins] text-[15px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          No liked movies this session
        </p>
      )}

      <div className="flex gap-3 flex-wrap justify-center">
        <Button onClick={onSwipeAgain} style={{ paddingLeft: 24, paddingRight: 24 }}>
          Swipe Again
        </Button>
        <Button
          variant="ghost"
          onClick={onChangeFilters}
          style={{ paddingLeft: 24, paddingRight: 24 }}
        >
          Change Filters
        </Button>
        <Button variant="ghost" onClick={onDashboard} style={{ paddingLeft: 24, paddingRight: 24 }}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}
