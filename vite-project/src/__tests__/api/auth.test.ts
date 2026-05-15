import { apiLogin, apiRegister } from '../../api/auth'

const mockFetch = (body: unknown, ok = true) => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(body),
  } as Response)
}

const successResponse = {
  access_token: 'test-token',
  user: { id: '1', email: 'test@example.com' },
}

describe('apiLogin', () => {
  it('returns auth response on success', async () => {
    mockFetch(successResponse)
    const result = await apiLogin('test@example.com', 'password')
    expect(result).toEqual(successResponse)
  })

  it('sends POST to /auth/login with correct body', async () => {
    mockFetch(successResponse)
    await apiLogin('user@test.com', 'pass123')
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com', password: 'pass123' }),
      })
    )
  })

  it('throws server error message on failure', async () => {
    mockFetch({ message: 'Invalid credentials' }, false)
    await expect(apiLogin('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  it('throws default message when server returns no message', async () => {
    mockFetch({}, false)
    await expect(apiLogin('test@example.com', 'pw')).rejects.toThrow('Login failed')
  })
})

describe('apiRegister', () => {
  it('returns auth response on success', async () => {
    mockFetch(successResponse)
    const result = await apiRegister('test@example.com', 'password', 'Alice')
    expect(result).toEqual(successResponse)
  })

  it('sends POST to /auth/register with name in body', async () => {
    mockFetch(successResponse)
    await apiRegister('user@test.com', 'pass123', 'Bob')
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/auth/register',
      expect.objectContaining({
        body: JSON.stringify({ email: 'user@test.com', password: 'pass123', name: 'Bob' }),
      })
    )
  })

  it('throws server error message on failure', async () => {
    mockFetch({ message: 'Email already in use' }, false)
    await expect(apiRegister('taken@example.com', 'pass')).rejects.toThrow('Email already in use')
  })

  it('throws default message when server returns no message', async () => {
    mockFetch({}, false)
    await expect(apiRegister('test@example.com', 'pw')).rejects.toThrow('Registration failed')
  })
})
