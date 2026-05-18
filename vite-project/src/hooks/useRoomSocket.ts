import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import type { RoomState } from '../api/rooms'

const WS_URL = 'http://localhost:4000'

export function useRoomSocket(
  code: string | undefined,
  onUpdate: (state: RoomState) => void
): void {
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    if (!code) return
    const socket = io(WS_URL, { transports: ['websocket'] })
    socket.on('connect', () => socket.emit('join-room', code))
    socket.on('room-updated', (state: RoomState) => onUpdateRef.current(state))
    return () => {
      socket.disconnect()
    }
  }, [code])
}
