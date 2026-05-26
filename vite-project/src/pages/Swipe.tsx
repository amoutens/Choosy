import { FC, useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageBackground } from '../components/PageBackground'
import { Logo } from '../components/Logo'
import { UserMenu } from '../components/UserMenu'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useRequireAuth, logout } from '../lib/token'
import { Movie, MovieFilters } from '../api/movies.types'
import { ROUTES } from '../lib/routes'
import { FilterPanel } from '../components/swipe/FilterPanel'
import { MovieCardStack } from '../components/swipe/MovieCardStack'
import { ResultsPanel } from '../components/swipe/ResultsPanel'
import { Phase } from '../components/swipe/swipeConfig'
import { useMovieFetcher } from '../hooks/useMovieFetcher'
import { useSwipeMechanics } from '../hooks/useSwipeMechanics'

const Swipe: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useRequireAuth()

  const [phase, setPhase] = useState<Phase>('filter')

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [minYear, setMinYear] = useState('')
  const [maxYear, setMaxYear] = useState('')
  const [minRating, setMinRating] = useState('')
  const [maxRating, setMaxRating] = useState('')

  const [liked, setLiked] = useState<string[]>([])
  const [disliked, setDisliked] = useState<string[]>([])

  const {
    movies,
    setMovies,
    isFetchingMore,
    noMoreMovies,
    fetchMore,
    needsMore,
    resetSession,
    getCached,
  } = useMovieFetcher()

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
    movies,
    onLike: (id) => setLiked((prev) => [...prev, id]),
    onDislike: (id) => setDisliked((prev) => [...prev, id]),
    onRemoveTop: () => setMovies((prev) => prev.slice(1)),
  })

  const likedMovies = useMemo(
    () => liked.map(getCached).filter((m): m is Movie => m !== undefined),
    [liked, getCached]
  )

  useEffect(() => {
    if (!needsMore(phase)) return
    fetchMore()
  }, [phase, isFetchingMore, noMoreMovies, movies.length, fetchMore, needsMore])

  useEffect(() => {
    if (phase !== 'swiping') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') dismiss('right')
      if (e.key === 'ArrowLeft') dismiss('left')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dismiss, phase])

  const startSwiping = () => {
    resetSession({
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      minRating: minRating !== '' ? parseFloat(minRating) : undefined,
      maxRating: maxRating !== '' ? parseFloat(maxRating) : undefined,
      startYear: minYear !== '' ? parseInt(minYear) : undefined,
      endYear: maxYear !== '' ? parseInt(maxYear) : undefined,
    } satisfies MovieFilters)
    reset()
    setLiked([])
    setDisliked([])
    setPhase('swiping')
  }

  const resetFilters = () => {
    setSelectedTypes([])
    setSelectedGenres([])
    setMinYear('')
    setMaxYear('')
    setMinRating('')
    setMaxRating('')
  }

  if (!user) return null

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
            {phase === 'results' ? t('swipe.subtitleComplete') : t('swipe.subtitleReady')}
          </p>
          <h1
            className="font-['Abril_Fatface'] text-[48px] text-transparent leading-none"
            style={{ WebkitTextStroke: '1.5px white' }}
          >
            {phase === 'results' ? t('swipe.titleResults') : t('swipe.titleSwiping')}
          </h1>
        </div>

        {phase === 'filter' && (
          <FilterPanel
            isLoading={false}
            selectedTypes={selectedTypes}
            selectedGenres={selectedGenres}
            minYear={minYear}
            maxYear={maxYear}
            minRating={minRating}
            maxRating={maxRating}
            onToggleType={(type) =>
              setSelectedTypes((prev) =>
                prev.includes(type) ? prev.filter((x) => x !== type) : [...prev, type]
              )
            }
            onToggleGenre={(genre) =>
              setSelectedGenres((prev) =>
                prev.includes(genre) ? prev.filter((x) => x !== genre) : [...prev, genre]
              )
            }
            onSetMinYear={setMinYear}
            onSetMaxYear={setMaxYear}
            onSetMinRating={setMinRating}
            onSetMaxRating={setMaxRating}
            onStartSwiping={startSwiping}
            onResetFilters={resetFilters}
          />
        )}

        {phase === 'swiping' && (
          <>
            {movies.length === 0 && noMoreMovies ? (
              <div className="flex flex-col items-center gap-4">
                <p
                  className="font-[Poppins] text-[15px]"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {t('swipe.noMovies')}
                </p>
                <button
                  className="font-[Poppins] text-[13px] underline"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  onClick={() => setPhase('filter')}
                >
                  {t('swipe.changeFilters')}
                </button>
              </div>
            ) : movies.length === 0 && isFetchingMore ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full border-2 animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }}
                />
                <p
                  className="font-[Poppins] text-[14px]"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {t('swipe.loadingMovies')}
                </p>
              </div>
            ) : (
              <MovieCardStack
                top={movies[0]}
                next={movies[1]}
                nextNext={movies[2]}
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
                onEndSession={() => setPhase('results')}
              />
            )}

            {isFetchingMore && movies.length > 0 && (
              <p className="font-[Poppins] text-[11px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                {t('swipe.loadingMore')}
              </p>
            )}
          </>
        )}

        {phase === 'results' && (
          <ResultsPanel
            likedCount={liked.length}
            dislikedCount={disliked.length}
            likedMovies={likedMovies}
            onSwipeAgain={startSwiping}
            onChangeFilters={() => setPhase('filter')}
            onDashboard={() => navigate(ROUTES.DASHBOARD)}
          />
        )}
      </div>
    </PageBackground>
  )
}

export default Swipe
