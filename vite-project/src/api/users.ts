import { API_BASE as API } from '../lib/constants'

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

export async function fetchMyProfile(): Promise<UserProfile> {
  const res = await fetch(`${API}/users/me`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json() as Promise<UserProfile>
}

export async function uploadAvatar(dataUrl: string): Promise<void> {
  const res = await fetch(`${API}/users/me/avatar`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ avatar: dataUrl }),
  })
  if (!res.ok) throw new Error('Failed to upload avatar')
}

export async function deleteAvatar(): Promise<void> {
  const res = await fetch(`${API}/users/me/avatar`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to remove avatar')
}
