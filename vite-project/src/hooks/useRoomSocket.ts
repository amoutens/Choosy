import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import type { RoomState } from '../api/rooms'

const WS_URL = 'http://localhost:4000'

export interface MovieRanking {
  imdbID: string
  score: number
  likeCount: number
}

export function useRoomSocket(
  code: string | undefined,
  onUpdate: (state: RoomState) => void,
  onLiveRecs?: (rankings: MovieRanking[]) => void
): void {
  const onUpdateRef = useRef(onUpdate)
  const onLiveRecsRef = useRef(onLiveRecs)

  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    onLiveRecsRef.current = onLiveRecs
  }, [onLiveRecs])

  useEffect(() => {
    if (!code) return
    const socket = io(WS_URL, { transports: ['websocket'] })
    socket.on('connect', () => socket.emit('join-room', code))
    socket.on('room-updated', (state: RoomState) => onUpdateRef.current(state))
    socket.on('live-recommendations', (rankings: MovieRanking[]) => {
      onLiveRecsRef.current?.(rankings)
    })
    return () => {
      socket.disconnect()
    }
  }, [code])
}
