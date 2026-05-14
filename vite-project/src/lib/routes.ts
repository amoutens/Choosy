export const ROUTES = {
  HOME:      '/',
  LOGIN:     '/login',
  REGISTER:  '/register',
  DASHBOARD: '/dashboard',
  PROFILE:   '/profile',
  ROOM:      (code: string) => `/room/${code}`,
} as const
