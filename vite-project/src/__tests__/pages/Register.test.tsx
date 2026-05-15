import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Register from '../../pages/Register'
import * as authApi from '../../api/auth'

jest.mock('../../api/auth')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const mockAuthApi = authApi as jest.Mocked<typeof authApi>

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )

describe('Register page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders heading, name, email, password fields, and submit button', () => {
    renderRegister()
    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByText('Name (optional)')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('renders link to login page', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('saves token and navigates to dashboard on successful registration', async () => {
    mockAuthApi.apiRegister.mockResolvedValueOnce({
      access_token: 'new-token',
      user: { id: '2', email: 'alice@example.com', name: 'Alice' },
    })

    renderRegister()
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Alice')
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'alice@example.com')
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('new-token')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message when registration fails', async () => {
    mockAuthApi.apiRegister.mockRejectedValueOnce(new Error('Email already in use'))

    renderRegister()
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'taken@example.com')
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument()
    })
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('shows loading state while request is in flight', async () => {
    let resolveRegister!: (v: authApi.AuthResponse) => void
    mockAuthApi.apiRegister.mockReturnValueOnce(
      new Promise((res) => {
        resolveRegister = res
      })
    )

    renderRegister()
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    const loadingBtn = await screen.findByRole('button', { name: 'Creating…' })
    expect(loadingBtn).toBeDisabled()

    resolveRegister({ access_token: 'token', user: { id: '1', email: 'test@example.com' } })
  })

  it('shows generic error when rejection is not an Error instance', async () => {
    mockAuthApi.apiRegister.mockRejectedValueOnce('unexpected')

    renderRegister()
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@example.com')
    await userEvent.type(screen.getByPlaceholderText('Min. 6 characters'), 'pass123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })
})
