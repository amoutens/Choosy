const API = 'http://localhost:4000/api'

export interface AuthResponse {
  access_token: string
  user: { id: string; email: string; name?: string }
}

export async function apiRegister(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? 'Registration failed')
  }
  return res.json()
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? 'Login failed')
  }
  return res.json()
}
