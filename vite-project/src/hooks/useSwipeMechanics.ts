import { useCallback, useEffect, useRef, useState } from 'react'
import { Movie } from '../api/movies.types'
import { SWIPE_THRESHOLD } from '../components/swipe/swipeConfig'

interface Options {
  movies: Movie[]
  onLike: (id: string) => void
  onDislike: (id: string) => void
  onRemoveTop: () => void
}

export function useSwipeMechanics({ movies, onLike, onDislike, onRemoveTop }: Options) {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dismissed, setDismissed] = useState<'left' | 'right' | null>(null)
  const [showPlot, setShowPlot] = useState(false)
  const startXRef = useRef(0)
  const hasDraggedRef = useRef(false)

  const onLikeRef = useRef(onLike)
  const onDislikeRef = useRef(onDislike)
  const onRemoveTopRef = useRef(onRemoveTop)
  useEffect(() => {
    onLikeRef.current = onLike
  })
  useEffect(() => {
    onDislikeRef.current = onDislike
  })
  useEffect(() => {
    onRemoveTopRef.current = onRemoveTop
  })

  const dismiss = useCallback(
    (direction: 'left' | 'right') => {
      if (dismissed || movies.length === 0) return
      const top = movies[0]
      if (direction === 'right') onLikeRef.current(top.imdbID)
      else onDislikeRef.current(top.imdbID)
      setDismissed(direction)
      setTimeout(() => {
        onRemoveTopRef.current()
        setOffset(0)
        setDismissed(null)
      }, 360)
    },
    [dismissed, movies]
  )

  const onPointerDown = (e: React.PointerEvent) => {
    if (dismissed) return
    hasDraggedRef.current = false
    setIsDragging(true)
    startXRef.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || dismissed) return
    const dx = e.clientX - startXRef.current
    if (Math.abs(dx) > 5) hasDraggedRef.current = true
    setOffset(dx)
  }

  const onPointerUp = () => {
    setIsDragging(false)
    if (offset > SWIPE_THRESHOLD) dismiss('right')
    else if (offset < -SWIPE_THRESHOLD) dismiss('left')
    else {
      setOffset(0)
      if (!hasDraggedRef.current) setShowPlot((prev) => !prev)
    }
  }

  const reset = () => {
    setOffset(0)
    setDismissed(null)
    setShowPlot(false)
  }

  const rotation = dismissed ? (dismissed === 'right' ? 18 : -18) : (offset / 420) * 14
  const translateX = dismissed ? (dismissed === 'right' ? 900 : -900) : offset
  const likeOpacity = Math.min(1, Math.max(0, offset / SWIPE_THRESHOLD))
  const nopeOpacity = Math.min(1, Math.max(0, -offset / SWIPE_THRESHOLD))

  return {
    offset,
    isDragging,
    dismissed,
    showPlot,
    rotation,
    translateX,
    likeOpacity,
    nopeOpacity,
    dismiss,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    reset,
  }
}
