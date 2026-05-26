import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterPanel } from '../swipe/FilterPanel'
import { Spinner } from '../ui/Spinner'
import { RoomState } from '../../api/rooms'

export interface LobbyViewProps {
  roomState: RoomState
  isHost: boolean
  isStarting: boolean
  startError: string
  selectedTypes: string[]
  selectedGenres: string[]
  minYear: string
  maxYear: string
  minRating: string
  maxRating: string
  onToggleType: (type: string) => void
  onToggleGenre: (genre: string) => void
  onSetMinYear: (value: string) => void
  onSetMaxYear: (value: string) => void
  onSetMinRating: (value: string) => void
  onSetMaxRating: (value: string) => void
  onStart: () => void
  onResetFilters: () => void
}

export const LobbyView: FC<LobbyViewProps> = ({
  roomState,
  isHost,
  isStarting,
  startError,
  selectedTypes,
  selectedGenres,
  minYear,
  maxYear,
  minRating,
  maxRating,
  onToggleType,
  onToggleGenre,
  onSetMinYear,
  onSetMaxYear,
  onSetMinRating,
  onSetMaxRating,
  onStart,
  onResetFilters,
}) => {
  const { t } = useTranslation()
  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-6">
      <div
        className="w-full rounded-3xl p-5"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <p
          className="font-[Poppins] text-[12px] font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {t('lobby.participants', { count: roomState.participants.length })}
        </p>
        <div className="flex flex-col gap-2">
          {roomState.participants.map((participant) => (
            <div key={participant.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {participant.avatar ? (
                  <img
                    src={participant.avatar}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-[Poppins] font-semibold text-[11px] flex-shrink-0"
                    style={{ background: 'linear-gradient(to bottom, #CE9FFC, #7367F0)' }}
                  >
                    {(participant.name || participant.userEmail).charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-[Poppins] text-[13px] text-white">
                  {participant.name || participant.userEmail}
                </span>
              </div>
              {participant.userId === roomState.hostId && (
                <span
                  className="font-[Poppins] text-[10px] px-2 py-0.5 rounded-lg"
                  style={{ background: 'rgba(206,159,252,0.15)', color: '#CE9FFC' }}
                >
                  {t('lobby.host')}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <>
          {startError && (
            <p
              className="font-[Poppins] text-[13px] text-center max-w-sm"
              style={{ color: '#ff7c7c' }}
            >
              {startError}
            </p>
          )}
          <FilterPanel
            isLoading={isStarting}
            selectedTypes={selectedTypes}
            selectedGenres={selectedGenres}
            minYear={minYear}
            maxYear={maxYear}
            minRating={minRating}
            maxRating={maxRating}
            onToggleType={onToggleType}
            onToggleGenre={onToggleGenre}
            onSetMinYear={onSetMinYear}
            onSetMaxYear={onSetMaxYear}
            onSetMinRating={onSetMinRating}
            onSetMaxRating={onSetMaxRating}
            onStartSwiping={onStart}
            onResetFilters={onResetFilters}
            startLabel={isStarting ? t('lobby.loadingMovies') : t('lobby.startVoting')}
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="font-[Poppins] text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {t('lobby.waitingForHost')}
          </p>
        </div>
      )}
    </div>
  )
}
