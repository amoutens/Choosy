import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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

const PlotOverlay: FC<{ movie: Movie }> = ({ movie }) => {
  const { t } = useTranslation()
  return (
    <div
      className="absolute inset-0 flex flex-col justify-end p-5"
      style={{ background: 'rgba(10,5,25,0.92)', backdropFilter: 'blur(6px)', zIndex: 10 }}
    >
      <h2 className="font-['Abril_Fatface'] text-white mb-2 leading-tight" style={{ fontSize: 18 }}>
        {movie.Title}
      </h2>
      <p
        className="font-poppins text-[13px] leading-relaxed mb-3"
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
      <p className="font-poppins text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {t('movieCard.tapToClose')}
      </p>
    </div>
  )
}

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
        <p className="font-poppins text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {movie.Year} · {movie.Runtime}
        </p>
        <p
          className="font-poppins text-[11px] mt-0.5 truncate"
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
          <span className="font-poppins font-semibold text-white" style={{ fontSize: 13 }}>
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
}) => {
  const { t } = useTranslation()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [skeletonVisible, setSkeletonVisible] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setSkeletonVisible(true), 100)
    return () => clearTimeout(id)
  }, [])

  return (
    <div
      className="absolute inset-0 rounded-3xl overflow-hidden"
      style={{
        zIndex: 3,
        transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
        transition:
          isDragging && !dismissed ? 'none' : 'transform 0.36s cubic-bezier(0.25,0.46,0.45,0.94)',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        boxShadow: '0 28px 60px rgba(0,0,0,0.55)',
        background: 'rgba(18,8,36,1)',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {skeletonVisible && !imageLoaded && (
        <div className="absolute inset-0 animate-pulse">
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2.5">
            <div className="flex items-end justify-between gap-2">
              <div className="flex flex-col gap-2 flex-1">
                <div
                  className="h-5 w-3/4 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                />
                <div
                  className="h-3 w-2/5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
                <div
                  className="h-3 w-3/5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
              </div>
              <div
                className="h-8 w-14 rounded-xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>
          </div>
        </div>
      )}

      <img
        src={movie.Poster}
        alt={movie.Title}
        className="w-full h-full object-cover"
        draggable={false}
        onLoad={() => setImageLoaded(true)}
        style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
      />

      {imageLoaded && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,5,25,0.96) 0%, rgba(10,5,25,0.35) 55%, transparent 100%)',
          }}
        />
      )}

      <SwipeLabel text={t('movieCard.like')} color="#4ade80" side="left" opacity={likeOpacity} />
      <SwipeLabel text={t('movieCard.nope')} color="#ff7c7c" side="right" opacity={nopeOpacity} />

      {imageLoaded && showPlot && <PlotOverlay movie={movie} />}
      {imageLoaded && <CardInfo movie={movie} />}
    </div>
  )
}
