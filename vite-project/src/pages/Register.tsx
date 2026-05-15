import { FC, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { apiRegister } from '../api/auth'
import { ROUTES } from '../lib/routes'

const Register: FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiRegister(email, password, name || undefined)
      localStorage.setItem('token', data.access_token)
      navigate(ROUTES.DASHBOARD)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2
        className="font-['Abril_Fatface'] text-[42px] text-transparent leading-none mb-1"
        style={{ WebkitTextStroke: '1.5px white' }}
      >
        Create Account
      </h2>
      <p className="font-[Poppins] text-[14px] mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="underline" style={{ color: '#A582F7' }}>
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Name (optional)"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label="Password"
          type="password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="font-[Poppins] text-[13px] text-center" style={{ color: '#ff7c7c' }}>
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
          {loading ? 'Creating…' : 'Sign Up'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default Register
