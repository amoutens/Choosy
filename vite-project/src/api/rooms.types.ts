import { Movie, MovieFilters } from './movies.types'

export enum RoomStatus {
  Waiting = 'waiting',
  Voting = 'voting',
  Results = 'results',
}

export interface Participant {
  userId: string
  userEmail: string
  name: string | null
  avatar: string | null
  hasFinished: boolean
}

export interface RoomState {
  id: string
  code: string
  hostId: string
  status: RoomStatus
  filters: MovieFilters
  movies: Movie[]
  participants: Participant[]
  createdAt: string
}

export interface MovieResult {
  movie: Movie
  score: number
  avgScore: number
  minScore: number
  likeCount: number
  alpha: number
}

export interface RoomResults {
  code: string
  movies: MovieResult[]
}
