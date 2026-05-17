export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SWIPE: '/swipe',
  ROOM: (code: string) => `/room/${code}`,
} as const
