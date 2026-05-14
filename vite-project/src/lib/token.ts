import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from './routes'

export interface TokenPayload {
  sub: string
  email: string
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function useRequireAuth(): TokenPayload | null {
  const navigate = useNavigate()
  const [user, setUser] = useState<TokenPayload | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate(ROUTES.LOGIN); return }
    const payload = decodeToken(token)
    if (!payload) { navigate(ROUTES.LOGIN); return }
    setUser(payload)
  }, [navigate])

  return user
}

export function logout(navigate: (path: string) => void) {
  localStorage.removeItem('token')
  navigate(ROUTES.HOME)
}
