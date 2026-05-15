import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../../pages/Login'
import * as authApi from '../../api/auth'

jest.mock('../../api/auth')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockAuthApi = authApi as jest.Mocked<typeof authApi>

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )

describe('Login page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders heading, email and password fields, and submit button', () => {
    renderLogin()
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('renders link to registration page', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
  })

  it('saves token and navigates to dashboard on successful login', async () => {
    mockAuthApi.apiLogin.mockResolvedValueOnce({
      access_token: 'test-jwt',
      user: { id: '1', email: 'test@example.com' },
    })

    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-jwt')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message when login fails', async () => {
    mockAuthApi.apiLogin.mockRejectedValueOnce(new Error('Invalid credentials'))

    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'bad@example.com')
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('shows loading state while request is in flight', async () => {
    let resolveLogin!: (v: authApi.AuthResponse) => void
    mockAuthApi.apiLogin.mockReturnValueOnce(
      new Promise((res) => {
        resolveLogin = res
      })
    )

    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'pass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    const loadingBtn = await screen.findByRole('button', { name: 'Signing in…' })
    expect(loadingBtn).toBeDisabled()

    resolveLogin({ access_token: 'token', user: { id: '1', email: 'test@example.com' } })
  })

  it('shows generic error when rejection is not an Error instance', async () => {
    mockAuthApi.apiLogin.mockRejectedValueOnce('unexpected')

    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'pass')
    await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })
})
