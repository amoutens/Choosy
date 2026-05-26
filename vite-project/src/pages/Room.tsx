import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageBackground } from '../components/PageBackground'
import { Logo } from '../components/Logo'
import { UserMenu } from '../components/UserMenu'
import { MovieCardStack } from '../components/swipe/MovieCardStack'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { LobbyView } from '../components/room/LobbyView'
import { LiveRecsPanel } from '../components/room/LiveRecsPanel'
import { WaitingResultsView } from '../components/room/WaitingResultsView'
import { ResultsView } from '../components/room/ResultsView'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useRequireAuth, logout } from '../lib/token'
import { useSwipeMechanics } from '../hooks/useSwipeMechanics'
import { useRoomSocket, MovieRanking } from '../hooks/useRoomSocket'
import { ROUTES } from '../lib/routes'
import { Movie, MovieFilters } from '../api/movies.types'
import {
  RoomState,
  RoomResults,
  RoomStatus,
  getRoomState,
  joinRoom,
  startRoom,
  submitVote,
  finishVoting,
  getRoomResults,
} from '../api/rooms'

enum LocalPhase {
  Joining = 'joining',
  Lobby = 'lobby',
  Voting = 'voting',
  Done = 'done',
  Results = 'results',
}

const Room: FC = () => {
  const { t } = useTranslation()
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const user = useRequireAuth()

  const [localPhase, setLocalPhase] = useState<LocalPhase>(LocalPhase.Joining)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [results, setResults] = useState<RoomResults | null>(null)
  const [movieRankings, setMovieRankings] = useState<MovieRanking[]>([])
  const [error, setError] = useState('')
  const [startError, setStartError] = useState('')
  const [isStarting, setIsStarting] = useState(false)

  const [votingMovies, setVotingMovies] = useState<Movie[]>([])
  // allMovies in state for rendering; allMoviesRef for stale-closure-free callbacks
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const allMoviesRef = useRef<Movie[]>([])
  const votingStartedRef = useRef(false)
  const resultsLoadedRef = useRef(false)
  const localPhaseRef = useRef<LocalPhase>(LocalPhase.Joining)
  const resetRef = useRef<() => void>(() => {})
  const applyServerStateRef = useRef<(state: RoomState) => void>(() => {})

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [minRating, setMinRating] = useState('')
  const [maxRating, setMaxRating] = useState('')

  const {
    dismissed,
    showPlot,
    rotation,
    translateX,
    likeOpacity,
    nopeOpacity,
    dismiss,
    reset,
    ...pointers
  } = useSwipeMechanics({
    movies: votingMovies,
    onLike: (id) => {
      const movie = allMoviesRef.current.find((m) => m.imdbID === id)
      if (movie && code) submitVote(code, id, 'like', movie).catch(() => {})
    },
    onDislike: (id) => {
      const movie = allMoviesRef.current.find((m) => m.imdbID === id)
      if (movie && code) submitVote(code, id, 'dislike', movie).catch(() => {})
    },
    onRemoveTop: () => setVotingMovies((prev) => prev.slice(1)),
  })

  useEffect(() => {
    localPhaseRef.current = localPhase
  })
  useEffect(() => {
    resetRef.current = reset
  })

  const handleEndVoting = useCallback(async () => {
    if (!code || localPhaseRef.current === LocalPhase.Done) return
    setLocalPhase(LocalPhase.Done)
    await finishVoting(code).catch(() => {})
  }, [code])

  useEffect(() => {
    if (
      votingStartedRef.current &&
      votingMovies.length === 0 &&
      localPhaseRef.current === LocalPhase.Voting
    ) {
      handleEndVoting()
    }
  }, [votingMovies.length, handleEndVoting])

  const applyServerState = useCallback(
    (state: RoomState) => {
      setRoomState(state)
      const phase = localPhaseRef.current
      const isInLobby = phase === LocalPhase.Joining || phase === LocalPhase.Lobby

      if (state.status === RoomStatus.Waiting && isInLobby) {
        setLocalPhase(LocalPhase.Lobby)
        return
      }

      if (state.status === RoomStatus.Voting && isInLobby) {
        allMoviesRef.current = state.movies
        setAllMovies(state.movies)
        votingStartedRef.current = true
        setVotingMovies(state.movies)
        resetRef.current()
        setLocalPhase(LocalPhase.Voting)
        return
      }

      if (state.status === RoomStatus.Voting && phase === LocalPhase.Voting) {
        const existingIds = new Set(allMoviesRef.current.map((m) => m.imdbID))
        const newMovies = state.movies.filter((m) => !existingIds.has(m.imdbID))
        const merged = [...allMoviesRef.current, ...newMovies]
        allMoviesRef.current = merged
        setAllMovies(merged)
        setVotingMovies((prev) => {
          if (prev.length === 0) return prev
          const [top, ...rest] = prev
          // Re-sort the unseen tail to match the server's canonical ranked order
          const serverOrder = new Map(state.movies.map((m, i) => [m.imdbID, i]))
          const sortedRest = [...rest, ...newMovies].sort(
            (a, b) => (serverOrder.get(a.imdbID) ?? 999) - (serverOrder.get(b.imdbID) ?? 999)
          )
          return [top, ...sortedRest]
        })
        return
      }

      if (state.status === RoomStatus.Results && phase !== LocalPhase.Results) {
        if (!resultsLoadedRef.current) {
          resultsLoadedRef.current = true
          getRoomResults(code!)
            .then(setResults)
            .catch(() => {})
        }
        setLocalPhase(LocalPhase.Results)
      }
    },
    [code]
  )

  useEffect(() => {
    applyServerStateRef.current = applyServerState
  }, [applyServerState])

  useEffect(() => {
    if (!user || !code) return
    const init = async () => {
      try {
        await joinRoom(code)
      } catch (e) {
        setError((e as Error).message)
        return
      }
      try {
        const state = await getRoomState(code)
        applyServerStateRef.current(state)
      } catch {
        // getRoomState failure is non-fatal; socket will deliver the state
      }
    }
    init()
  }, [user, code])

  useRoomSocket(
    code,
    (state) => applyServerStateRef.current(state),
    (rankings) => {
      setMovieRankings(rankings)
      setVotingMovies((prev) => {
        if (prev.length <= 1) return prev
        const [top, ...rest] = prev
        const scoreMap = new Map(rankings.map((r) => [r.imdbID, r.score]))
        return [
          top,
          ...rest.sort((a, b) => (scoreMap.get(b.imdbID) ?? 0) - (scoreMap.get(a.imdbID) ?? 0)),
        ]
      })
    }
  )

  const handleStart = async () => {
    if (!code) return
    setIsStarting(true)
    setStartError('')
    try {
      await startRoom(
        code,
        buildRoomFilters({ selectedTypes, selectedGenres, minYear, maxYear, minRating, maxRating })
      )
    } catch (e) {
      setStartError((e as Error).message)
    } finally {
      setIsStarting(false)
    }
  }

  const handleResetFilters = () => {
    setSelectedTypes([])
    setSelectedGenres([])
    setMinYear('')
    setMaxYear('')
    setMinRating('')
    setMaxRating('')
  }

  if (!user) return null

  const isHost = roomState?.hostId === user.sub
  const totalCards = allMovies.length
  const swipedCount = totalCards - votingMovies.length

  const subtitle =
    localPhase === LocalPhase.Results
      ? t('room.subtitleComplete')
      : localPhase === LocalPhase.Voting || localPhase === LocalPhase.Done
        ? t('room.subtitleSwiping')
        : t('room.subtitleGroup')

  const title =
    localPhase === LocalPhase.Results
      ? t('room.titleResults')
      : localPhase === LocalPhase.Voting || localPhase === LocalPhase.Done
        ? t('room.titleVoting')
        : t('room.titleLobby')

  return (
    <PageBackground>
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-10 py-5">
        <Logo />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserMenu email={user.email} userId={user.sub} onLogout={() => logout(navigate)} />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-8 px-6 pt-24 pb-10">
        <div className="text-center">
          <p className="font-[Poppins] text-[14px] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {subtitle}
          </p>
          <h1
            className="font-['Abril_Fatface'] text-[48px] text-transparent leading-none"
            style={{ WebkitTextStroke: '1.5px white' }}
          >
            {title}
          </h1>
        </div>

        {localPhase !== LocalPhase.Results && code && (
          <div
            className="flex items-center gap-3 px-5 py-2 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <span className="font-[Poppins] text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('room.roomCode')}
            </span>
            <span
              className="font-[Poppins] font-bold text-[20px] text-white tracking-widest"
              style={{ letterSpacing: '0.25em' }}
            >
              {code}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(code)}
              className="font-[Poppins] text-[11px] px-2 py-0.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              {t('room.copy')}
            </button>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3">
            <p className="font-[Poppins] text-[14px]" style={{ color: '#ff7c7c' }}>
              {error}
            </p>
            <Button variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)}>
              {t('room.backToDashboard')}
            </Button>
          </div>
        )}

        {!error && localPhase === LocalPhase.Joining && <Spinner />}

        {!error && localPhase === LocalPhase.Lobby && roomState && (
          <LobbyView
            roomState={roomState}
            isHost={isHost}
            isStarting={isStarting}
            startError={startError}
            selectedTypes={selectedTypes}
            selectedGenres={selectedGenres}
            minYear={minYear}
            maxYear={maxYear}
            minRating={minRating}
            maxRating={maxRating}
            onToggleType={(type) =>
              setSelectedTypes((prev) =>
                prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
              )
            }
            onToggleGenre={(genre) =>
              setSelectedGenres((prev) =>
                prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre]
              )
            }
            onSetMinYear={setMinYear}
            onSetMaxYear={setMaxYear}
            onSetMinRating={setMinRating}
            onSetMaxRating={setMaxRating}
            onStart={handleStart}
            onResetFilters={handleResetFilters}
          />
        )}

        {!error && localPhase === LocalPhase.Voting && (
          <>
            {votingMovies.length > 0 ? (
              <>
                <MovieCardStack
                  top={votingMovies[0]}
                  next={votingMovies[1]}
                  nextNext={votingMovies[2]}
                  translateX={translateX}
                  rotation={rotation}
                  isDragging={pointers.isDragging}
                  dismissed={dismissed}
                  showPlot={showPlot}
                  likeOpacity={likeOpacity}
                  nopeOpacity={nopeOpacity}
                  onPointerDown={pointers.onPointerDown}
                  onPointerMove={pointers.onPointerMove}
                  onPointerUp={pointers.onPointerUp}
                  onDismiss={dismiss}
                  onEndSession={handleEndVoting}
                />
                <p
                  className="font-[Poppins] text-[12px]"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  {t('room.swiped', { count: swipedCount, total: totalCards })}
                </p>
                {movieRankings.length > 0 && (
                  <LiveRecsPanel rankings={movieRankings} allMovies={allMovies} />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p
                  className="font-[Poppins] text-[15px]"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {t('room.noMovies')}
                </p>
                <Button variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)}>
                  {t('room.backToDashboard')}
                </Button>
              </div>
            )}
          </>
        )}

        {!error && localPhase === LocalPhase.Done && roomState && (
          <WaitingResultsView participants={roomState.participants} />
        )}

        {!error && localPhase === LocalPhase.Results && results && roomState && (
          <ResultsView
            results={results}
            participants={roomState.participants}
            onDashboard={() => navigate(ROUTES.DASHBOARD)}
          />
        )}
      </div>
    </PageBackground>
  )
}

function buildRoomFilters({
  selectedTypes,
  selectedGenres,
  minYear,
  maxYear,
  minRating,
  maxRating,
}: {
  selectedTypes: string[]
  selectedGenres: string[]
  minYear: string
  maxYear: string
  minRating: string
  maxRating: string
}): MovieFilters {
  return {
    types: selectedTypes.length > 0 ? selectedTypes : undefined,
    genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    minRating: minRating !== '' ? parseFloat(minRating) : undefined,
    maxRating: maxRating !== '' ? parseFloat(maxRating) : undefined,
    startYear: minYear !== '' ? parseInt(minYear) : undefined,
    endYear: maxYear !== '' ? parseInt(maxYear) : undefined,
  }
}

export default Room
