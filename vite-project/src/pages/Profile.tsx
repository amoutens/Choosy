import { FC, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

function decodeToken(token: string): { email: string; sub: string } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const Profile: FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    const payload = decodeToken(token)
    if (!payload) { navigate('/login'); return }
    setEmail(payload.email)
    setUserId(payload.sub)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const initials = email ? email[0].toUpperCase() : '?'

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-2 mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center font-[Poppins] font-bold text-white text-[32px]"
          style={{ background: 'linear-gradient(135deg, #CE9FFC, #7367F0)' }}
        >
          {initials}
        </div>
        <p className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ID: {userId}
        </p>
      </div>

      <h2
        className="font-['Abril_Fatface'] text-[42px] text-transparent leading-none mb-6"
        style={{ WebkitTextStroke: '1.5px white' }}
      >
        My Profile
      </h2>

      <div className="flex flex-col gap-3 mb-8">
        <div
          className="rounded-2xl px-4 py-4"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <p className="font-[Poppins] text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</p>
          <p className="font-[Poppins] text-[15px] text-white">{email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          to="/dashboard"
          className="flex items-center justify-center font-[Poppins] font-semibold text-[16px] rounded-2xl text-white"
          style={{ height: '50px', background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)' }}
        >
          Back to Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center font-[Poppins] text-[15px] rounded-2xl transition-colors"
          style={{ height: '50px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#ff7c7c' }}
        >
          Log Out
        </button>
      </div>
    </AuthLayout>
  )
}

export default Profile
