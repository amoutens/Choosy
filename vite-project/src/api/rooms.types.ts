import { Movie, MovieFilters } from './movies.types'

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
  status: 'waiting' | 'voting' | 'results'
  filters: MovieFilters
  movies: Movie[]
  participants: Participant[]
  createdAt: string
}

export interface MovieResult {
  movie: Movie
  likedBy: string[]
  likeCount: number
}

export interface RoomResults {
  code: string
  movies: MovieResult[]
}
