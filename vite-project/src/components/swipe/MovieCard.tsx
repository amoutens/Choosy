import { FC } from 'react'
import { Movie } from '../../api/movies.types'

const SwipeLabel: FC<{ text: string; color: string; side: 'left' | 'right'; opacity: number }> = ({
  text,
  color,
  side,
  opacity,
}) => (
  <div
    className={`absolute top-8 ${side === 'left' ? 'left-5' : 'right-5'} px-3 py-1 rounded-xl`}
    style={{
      opacity,
      border: `3px solid ${color}`,
      transform: `rotate(${side === 'left' ? '-' : ''}18deg)`,
    }}
  >
    <span className="font-['Abril_Fatface'] text-[26px]" style={{ color }}>
      {text}
    </span>
  </div>
)

const PlotOverlay: FC<{ movie: Movie }> = ({ movie }) => (
  <div
    className="absolute inset-0 flex flex-col justify-end p-5"
    style={{ background: 'rgba(10,5,25,0.92)', backdropFilter: 'blur(6px)', zIndex: 10 }}
  >
    <h2 className="font-['Abril_Fatface'] text-white mb-2 leading-tight" style={{ fontSize: 18 }}>
      {movie.Title}
    </h2>
    <p
      className="font-[Poppins] text-[13px] leading-relaxed mb-3"
      style={{
        color: 'rgba(255,255,255,0.82)',
        display: '-webkit-box',
        WebkitLineClamp: 7,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {movie.Plot}
    </p>
    <p className="font-[Poppins] text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
      tap to close
    </p>
  </div>
)

const CardInfo: FC<{ movie: Movie }> = ({ movie }) => (
  <div className="absolute bottom-0 left-0 right-0 p-5">
    <div className="flex items-end justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h2
          className="font-['Abril_Fatface'] text-white leading-tight"
          style={{ fontSize: 'clamp(16px,5vw,22px)' }}
        >
          {movie.Title}
        </h2>
        <p className="font-[Poppins] text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {movie.Year} · {movie.Runtime}
        </p>
        <p
          className="font-[Poppins] text-[11px] mt-0.5 truncate"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {movie.Genre}
        </p>
      </div>
      {movie.imdbRating !== 'N/A' && (
        <div
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)' }}
        >
          <span style={{ color: '#facc15', fontSize: 13 }}>★</span>
          <span className="font-[Poppins] font-semibold text-white" style={{ fontSize: 13 }}>
            {movie.imdbRating}
          </span>
        </div>
      )}
    </div>
  </div>
)

interface MovieCardProps {
  movie: Movie
  translateX: number
  rotation: number
  isDragging: boolean
  dismissed: 'left' | 'right' | null
  showPlot: boolean
  likeOpacity: number
  nopeOpacity: number
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: () => void
}

export const MovieCard: FC<MovieCardProps> = ({
  movie,
  translateX,
  rotation,
  isDragging,
  dismissed,
  showPlot,
  likeOpacity,
  nopeOpacity,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => (
  <div
    className="absolute inset-0 rounded-3xl overflow-hidden"
    style={{
      zIndex: 3,
      transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
      transition:
        isDragging && !dismissed
          ? 'none'
          : 'transform 0.36s cubic-bezier(0.25,0.46,0.45,0.94)',
      cursor: isDragging ? 'grabbing' : 'grab',
      touchAction: 'none',
      boxShadow: '0 28px 60px rgba(0,0,0,0.55)',
    }}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerUp}
  >
    <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover" draggable={false} />
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(to top, rgba(10,5,25,0.96) 0%, rgba(10,5,25,0.35) 55%, transparent 100%)',
      }}
    />

    <SwipeLabel text="LIKE" color="#4ade80" side="left" opacity={likeOpacity} />
    <SwipeLabel text="NOPE" color="#ff7c7c" side="right" opacity={nopeOpacity} />

    {showPlot && <PlotOverlay movie={movie} />}
    <CardInfo movie={movie} />
  </div>
)
