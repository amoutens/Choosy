import { FC, useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { apiRegister } from '../api/auth'

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '52px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '12px',
  padding: '0 16px',
  color: '#fff',
  fontSize: '16px',
  fontFamily: 'Poppins, sans-serif',
  outline: 'none',
}

const Register: FC = () => {
  const navigate = useNavigate()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiRegister(email, password, name || undefined)
      localStorage.setItem('token', data.access_token)
      navigate('/dashboard')
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
        <Link to="/login" className="underline" style={{ color: '#A582F7' }}>
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Name (optional)
          </label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {error && (
          <p className="font-[Poppins] text-[13px] text-center" style={{ color: '#ff7c7c' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex items-center justify-center font-[Poppins] font-semibold text-[18px] rounded-2xl text-white transition-opacity disabled:opacity-60"
          style={{ height: '56px', background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)' }}
        >
          {loading ? 'Creating…' : 'Sign Up'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default Register
