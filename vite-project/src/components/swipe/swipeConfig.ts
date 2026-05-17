export const SWIPE_THRESHOLD = 90

export const TYPE_OPTIONS = [
  { label: 'Movie', value: 'MOVIE' },
  { label: 'TV Series', value: 'TV_SERIES' },
  { label: 'Mini Series', value: 'TV_MINI_SERIES' },
  { label: 'TV Movie', value: 'TV_MOVIE' },
  { label: 'Short', value: 'SHORT' },
]

export const GENRE_OPTIONS = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller',
  'War',
  'Western',
]

export type Phase = 'filter' | 'swiping' | 'results'
