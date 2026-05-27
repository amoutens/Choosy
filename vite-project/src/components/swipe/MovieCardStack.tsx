import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Movie } from '../../api/movies.types'
import { MovieCard } from './MovieCard'

interface MovieCardStackProps {
  top?: Movie
  next?: Movie
  nextNext?: Movie
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
  onDismiss: (dir: 'left' | 'right') => void
  onEndSession: () => void
}

const nopeBtn = {
  width: 60,
  height: 60,
  background: 'rgba(255,255,255,0.07)',
  border: '2px solid rgba(255,124,124,0.55)',
  color: '#ff7c7c',
  fontSize: 22,
  boxShadow: '0 4px 20px rgba(255,124,124,0.15)',
} as const

const likeBtn = {
  width: 60,
  height: 60,
  background: 'rgba(255,255,255,0.07)',
  border: '2px solid rgba(74,222,128,0.55)',
  color: '#4ade80',
  fontSize: 22,
  boxShadow: '0 4px 20px rgba(74,222,128,0.15)',
} as const

const endBtn = {
  width: 52,
  height: 52,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.14)',
  color: 'rgba(255,255,255,0.45)',
  fontSize: 10,
} as const

export const MovieCardStack: FC<MovieCardStackProps> = ({
  top,
  next,
  nextNext,
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
  onDismiss,
  onEndSession,
}) => {
  const { t } = useTranslation()
  return (
    <>
      <div className="relative select-none" style={{ width: 310, height: 450 }}>
        {nextNext && (
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              transform: 'scale(0.88) translateY(22px)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              zIndex: 1,
            }}
          />
        )}
        {next && (
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            style={{ transform: 'scale(0.94) translateY(11px)', zIndex: 2 }}
          >
            <img
              src={next.Poster}
              alt={next.Title}
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(10,5,25,0.85) 0%, transparent 60%)',
              }}
            />
          </div>
        )}
        {top && (
          <MovieCard
            movie={top}
            translateX={translateX}
            rotation={rotation}
            isDragging={isDragging}
            dismissed={dismissed}
            showPlot={showPlot}
            likeOpacity={likeOpacity}
            nopeOpacity={nopeOpacity}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        )}
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => onDismiss('left')}
          disabled={!!dismissed}
          className="flex items-center justify-center rounded-full transition-transform active:scale-90 cursor-pointer disabled:cursor-default"
          style={nopeBtn}
        >
          ✕
        </button>
        <button
          onClick={onEndSession}
          className="flex flex-col items-center justify-center gap-0.5 rounded-2xl font-poppins transition-transform active:scale-95 cursor-pointer"
          style={endBtn}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>⏹</span>
          {t('movieCardStack.end')}
        </button>
        <button
          onClick={() => onDismiss('right')}
          disabled={!!dismissed}
          className="flex items-center justify-center rounded-full transition-transform active:scale-90 cursor-pointer disabled:cursor-default"
          style={likeBtn}
        >
          ♥
        </button>
      </div>

      <p className="font-poppins text-[12px]" style={{ color: 'rgba(255,255,255,0.22)' }}>
        {t('movieCardStack.hint')}
      </p>
    </>
  )
}
