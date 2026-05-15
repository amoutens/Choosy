import { decodeToken, logout } from '../../lib/token'

const validPayload = { sub: 'user-123', email: 'test@example.com' }
const validToken = `header.${btoa(JSON.stringify(validPayload))}.signature`

describe('decodeToken', () => {
  it('decodes a valid JWT payload', () => {
    expect(decodeToken(validToken)).toEqual(validPayload)
  })

  it('returns null for a malformed token (no dots)', () => {
    expect(decodeToken('notajwt')).toBeNull()
  })

  it('returns null for invalid base64 in payload segment', () => {
    expect(decodeToken('header.!!!invalid!!!.signature')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(decodeToken('')).toBeNull()
  })
})

describe('logout', () => {
  it('removes the token from localStorage', () => {
    localStorage.setItem('token', 'some-jwt')
    logout(jest.fn())
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('calls navigate with the home route', () => {
    const navigate = jest.fn()
    logout(navigate)
    expect(navigate).toHaveBeenCalledWith('/')
  })
})
