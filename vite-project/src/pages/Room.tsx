import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageBackground } from '../components/PageBackground'
import { Logo } from '../components/Logo'
import { UserMenu } from '../components/UserMenu'
import { FilterPanel } from '../components/swipe/FilterPanel'
import { MovieCardStack } from '../components/swipe/MovieCardStack'
import { Button } from '../components/ui/Button'
import { useRequireAuth, logout } from '../lib/token'
import { useSwipeMechanics } from '../hooks/useSwipeMechanics'
import { useRoomSocket } from '../hooks/useRoomSocket'
import { ROUTES } from '../lib/routes'
import { Movie, MovieFilters } from '../api/movies.types'
import {
  RoomState,
  RoomResults,
  getRoomState,
  joinRoom,
  startRoom,
  submitVote,
  finishVoting,
  getRoomResults,
} from '../api/rooms'

type LocalPhase = 'joining' | 'lobby' | 'voting' | 'done' | 'results'

const Room: FC = () => {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const user = useRequireAuth()

  const [localPhase, setLocalPhase] = useState<LocalPhase>('joining')
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [results, setResults] = useState<RoomResults | null>(null)
  const [error, setError] = useState('')
  const [startError, setStartError] = useState('')
  const [isStarting, setIsStarting] = useState(false)

  const [votingMovies, setVotingMovies] = useState<Movie[]>([])
  const allMoviesRef = useRef<Movie[]>([])
  const votingStartedRef = useRef(false)
  const resultsLoadedRef = useRef(false)
  const localPhaseRef = useRef<LocalPhase>('joining')
  localPhaseRef.current = localPhase

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [minRating, setMinRating] = useState('')
  const [maxRating, setMaxRating] = useState('')

  const { dismissed, showPlot, rotation, translateX, likeOpacity, nopeOpacity, dismiss, reset, ...pointers } =
    useSwipeMechanics({
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
    if (
      votingStartedRef.current &&
      votingMovies.length === 0 &&
      localPhaseRef.current === 'voting'
    ) {
      handleEndVoting()
    }
  }, [votingMovies.length])

  const resetRef = useRef(reset)
  resetRef.current = reset

  const applyServerState = useCallback((state: RoomState) => {
    setRoomState(state)
    const phase = localPhaseRef.current

    if (state.status === 'waiting' && (phase === 'joining' || phase === 'lobby')) {
      setLocalPhase('lobby')
    } else if (state.status === 'voting' && (phase === 'joining' || phase === 'lobby')) {
      allMoviesRef.current = state.movies
      votingStartedRef.current = true
      setVotingMovies(state.movies)
      resetRef.current()
      setLocalPhase('voting')
    } else if (state.status === 'results' && phase !== 'results') {
      if (!resultsLoadedRef.current) {
        resultsLoadedRef.current = true
        getRoomResults(code!).then(setResults).catch(() => {})
      }
      setLocalPhase('results')
    }
  }, [code])

  const applyServerStateRef = useRef(applyServerState)
  applyServerStateRef.current = applyServerState

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
      } catch {}
    }
    init()
  }, [user, code])

  useRoomSocket(code, (state) => applyServerStateRef.current(state))

  const handleStart = async () => {
    if (!code) return
    setIsStarting(true)
    setStartError('')
    const filters: MovieFilters = {
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      minRating: minRating !== '' ? parseFloat(minRating) : undefined,
      maxRating: maxRating !== '' ? parseFloat(maxRating) : undefined,
      startYear: minYear !== '' ? parseInt(minYear) : undefined,
      endYear: maxYear !== '' ? parseInt(maxYear) : undefined,
    }
    try {
      await startRoom(code, filters)
    } catch (e) {
      setStartError((e as Error).message)
    } finally {
      setIsStarting(false)
    }
  }

  const handleEndVoting = useCallback(async () => {
    if (!code || localPhaseRef.current === 'done') return
    setLocalPhase('done')
    await finishVoting(code).catch(() => {})
  }, [code])

  if (!user) return null

  const isHost = roomState?.hostId === user.sub
  const totalCards = allMoviesRef.current.length
  const swipedCount = totalCards - votingMovies.length

  const subtitle =
    localPhase === 'results'
      ? 'session complete'
      : localPhase === 'voting' || localPhase === 'done'
        ? 'swiping together'
        : 'group session'

  const title =
    localPhase === 'results'
      ? 'Group Picks'
      : localPhase === 'voting' || localPhase === 'done'
        ? 'Pick Your Movie'
        : 'Room'

  return (
    <PageBackground>
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-10 py-5">
        <Logo />
        <UserMenu email={user.email} userId={user.sub} onLogout={() => logout(navigate)} />
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

        {localPhase !== 'results' && code && (
          <div
            className="flex items-center gap-3 px-5 py-2 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <span className="font-[Poppins] text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              room code
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
              copy
            </button>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3">
            <p className="font-[Poppins] text-[14px]" style={{ color: '#ff7c7c' }}>
              {error}
            </p>
            <Button variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {!error && localPhase === 'joining' && (
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }}
          />
        )}

        {!error && localPhase === 'lobby' && roomState && (
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
            onToggleType={(t) =>
              setSelectedTypes((prev) =>
                prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
              )
            }
            onToggleGenre={(g) =>
              setSelectedGenres((prev) =>
                prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
              )
            }
            onSetMinYear={setMinYear}
            onSetMaxYear={setMaxYear}
            onSetMinRating={setMinRating}
            onSetMaxRating={setMaxRating}
            onStart={handleStart}
            onResetFilters={() => {
              setSelectedTypes([])
              setSelectedGenres([])
              setMinYear('')
              setMaxYear('')
              setMinRating('')
              setMaxRating('')
            }}
          />
        )}

        {!error && localPhase === 'voting' && (
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
                <p className="font-[Poppins] text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {swipedCount} / {totalCards} swiped
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="font-[Poppins] text-[15px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  No movies to swipe
                </p>
                <Button variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)}>
                  Back to Dashboard
                </Button>
              </div>
            )}
          </>
        )}

        {!error && localPhase === 'done' && roomState && (
          <WaitingResultsView participants={roomState.participants} />
        )}

        {!error && localPhase === 'results' && results && roomState && (
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

interface LobbyViewProps {
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
  onToggleType: (t: string) => void
  onToggleGenre: (g: string) => void
  onSetMinYear: (v: string) => void
  onSetMaxYear: (v: string) => void
  onSetMinRating: (v: string) => void
  onSetMaxRating: (v: string) => void
  onStart: () => void
  onResetFilters: () => void
}

const LobbyView: FC<LobbyViewProps> = ({
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
}) => (
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
        Participants ({roomState.participants.length})
      </p>
      <div className="flex flex-col gap-2">
        {roomState.participants.map((p) => (
          <div key={p.userId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-[Poppins] font-semibold text-[11px]"
                style={{ background: 'linear-gradient(to bottom, #CE9FFC, #7367F0)' }}
              >
                {p.userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="font-[Poppins] text-[13px] text-white">{p.userEmail}</span>
            </div>
            {p.userId === roomState.hostId && (
              <span
                className="font-[Poppins] text-[10px] px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(206,159,252,0.15)', color: '#CE9FFC' }}
              >
                host
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
          startLabel={isStarting ? 'Loading movies…' : 'Start Voting'}
        />
      </>
    ) : (
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }}
        />
        <p className="font-[Poppins] text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Waiting for host to start…
        </p>
      </div>
    )}
  </div>
)

interface WaitingResultsViewProps {
  participants: RoomState['participants']
}

const WaitingResultsView: FC<WaitingResultsViewProps> = ({ participants }) => {
  const doneCount = participants.filter((p) => p.hasFinished).length
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-10 h-10 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }}
      />
      <p className="font-[Poppins] text-[15px] text-white">Waiting for everyone…</p>
      <p className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {doneCount} / {participants.length} finished
      </p>
    </div>
  )
}

interface ResultsViewProps {
  results: RoomResults
  participants: RoomState['participants']
  onDashboard: () => void
}

const ResultsView: FC<ResultsViewProps> = ({ results, participants, onDashboard }) => {
  const total = participants.length
  const matches = results.movies.filter((m) => m.likeCount === total)
  const others = results.movies.filter((m) => m.likeCount < total && m.likeCount > 0)

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-6">
      <div className="flex gap-6 font-[Poppins] text-[14px]">
        <span style={{ color: '#4ade80' }}>★ {matches.length} everyone liked</span>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>{results.movies.length} total picks</span>
      </div>

      {results.movies.length === 0 ? (
        <p className="font-[Poppins] text-[15px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          No one liked the same movies
        </p>
      ) : (
        <div
          className="w-full rounded-3xl p-5"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {matches.length > 0 && (
            <>
              <p
                className="font-[Poppins] text-[12px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: '#4ade80' }}
              >
                Everyone liked
              </p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {matches.map(({ movie, likeCount }) => (
                  <MovieResultCard key={movie.imdbID} movie={movie} likeCount={likeCount} total={total} />
                ))}
              </div>
            </>
          )}

          {others.length > 0 && (
            <>
              <p
                className="font-[Poppins] text-[12px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Some liked
              </p>
              <div className="grid grid-cols-3 gap-3">
                {others.map(({ movie, likeCount }) => (
                  <MovieResultCard key={movie.imdbID} movie={movie} likeCount={likeCount} total={total} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Button onClick={onDashboard} style={{ paddingLeft: 32, paddingRight: 32 }}>
        Back to Dashboard
      </Button>
    </div>
  )
}

const MovieResultCard: FC<{ movie: Movie; likeCount: number; total: number }> = ({
  movie,
  likeCount,
  total,
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '2/3' }}>
      <img src={movie.Poster} alt={movie.Title} className="w-full h-full object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(10,5,25,0.9) 0%, transparent 55%)' }}
      />
      <div
        className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg"
        style={{
          background: likeCount === total ? 'rgba(74,222,128,0.25)' : 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <span style={{ color: likeCount === total ? '#4ade80' : 'rgba(255,255,255,0.5)', fontSize: 9 }}>
          ♥
        </span>
        <span
          className="font-[Poppins] font-semibold"
          style={{ fontSize: 10, color: likeCount === total ? '#4ade80' : 'rgba(255,255,255,0.7)' }}
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
    <p className="font-[Poppins]" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
      {movie.Year}
    </p>
  </div>
)

export default Room
