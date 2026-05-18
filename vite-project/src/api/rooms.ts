import { API_BASE } from '../lib/constants'
import { Movie, MovieFilters } from './movies.types'
import { RoomState, RoomResults } from './rooms.types'

export type { RoomState, RoomResults, Participant, MovieResult } from './rooms.types'
export { RoomStatus } from './rooms.types'

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export async function createRoom(): Promise<{ code: string }> {
  const res = await fetch(`${API_BASE}/rooms`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to create room')
  return res.json()
}

export async function getRoomState(code: string): Promise<RoomState> {
  const res = await fetch(`${API_BASE}/rooms/${code}`, { headers: headers() })
  if (!res.ok) throw new Error('Room not found')
  return res.json()
}

export async function joinRoom(code: string): Promise<void> {
  const res = await fetch(`${API_BASE}/rooms/${code}/join`, {
    method: 'POST',
    headers: headers(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message ?? 'Failed to join room')
  }
}

export async function startRoom(code: string, filters: MovieFilters): Promise<void> {
  const res = await fetch(`${API_BASE}/rooms/${code}/start`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ filters }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message ?? 'Failed to start room')
  }
}

export async function submitVote(
  code: string,
  movieId: string,
  vote: 'like' | 'dislike',
  movieData: Movie,
): Promise<void> {
  await fetch(`${API_BASE}/rooms/${code}/vote`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ movieId, vote, movieData }),
  })
}

export async function finishVoting(code: string): Promise<void> {
  await fetch(`${API_BASE}/rooms/${code}/finish`, {
    method: 'POST',
    headers: headers(),
  })
}

export async function getRoomResults(code: string): Promise<RoomResults> {
  const res = await fetch(`${API_BASE}/rooms/${code}/results`, {
    headers: headers(),
  })
  if (!res.ok) throw new Error('Failed to load results')
  return res.json()
}
