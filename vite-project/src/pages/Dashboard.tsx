import { FC, useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import FilmIcon from '../assets/icons/FilmIcon'
import FilmIconSecondary from '../assets/icons/FilmIconSecondary'
import ChoosyIcon from '../assets/icons/ChoosyIcon'
import { cn } from '../lib/utils'

const bgIcons: { type: 'reel' | 'strip'; style: React.CSSProperties }[] = [
  { type: 'reel',  style: { top: '5%',  left: '5%' } },
  { type: 'strip', style: { top: '10%', left: '20%',  transform: 'rotate(30deg)' } },
  { type: 'reel',  style: { top: '8%',  left: '40%' } },
  { type: 'strip', style: { top: '7%',  left: '60%',  transform: 'rotate(-20deg)' } },
  { type: 'strip', style: { top: '10%', right: '5%',  transform: 'rotate(-2deg)' } },
  { type: 'reel',  style: { top: '18%', right: '20%' } },
  { type: 'strip', style: { top: '33%', left: '7%',   transform: 'rotate(-20deg)' } },
  { type: 'reel',  style: { top: '40%', right: '5%' } },
  { type: 'reel',  style: { top: '59%', left: '8%' } },
  { type: 'strip', style: { top: '63%', right: '6%',  transform: 'rotate(-45deg)' } },
  { type: 'strip', style: { top: '80%', left: '10%',  transform: 'rotate(-20deg)' } },
  { type: 'reel',  style: { top: '79%', left: '24%' } },
  { type: 'strip', style: { top: '77%', left: '71%',  transform: 'rotate(-10deg)' } },
  { type: 'reel',  style: { top: '87%', right: '7%' } },
]

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function decodeToken(token: string): { email: string; sub: string } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const Dashboard: FC = () => {
  const navigate = useNavigate()
  const [userEmail, setUserEmail]     = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createdCode, setCreatedCode] = useState('')
  const [showJoin, setShowJoin]     = useState(false)
  const [joinCode, setJoinCode]     = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    const payload = decodeToken(token)
    if (!payload) { navigate('/login'); return }
    setUserEmail(payload.email)
  }, [navigate])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const handleCreateRoom = () => {
    setCreatedCode(generateRoomCode())
    setShowCreate(true)
  }

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return
    navigate(`/room/${joinCode.trim().toUpperCase()}`)
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : '?'

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Purple glow */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div
          className="absolute rounded-[50%]"
          style={{ width: '800px', height: '300px', background: '#9378F4', opacity: 0.76, filter: 'blur(90px)' }}
        />
      </div>

      {/* Background icons */}
      {bgIcons.map((icon, i) => (
        <div key={i} className="absolute pointer-events-none opacity-90" style={icon.style}>
          {icon.type === 'reel' ? <FilmIcon /> : <FilmIconSecondary />}
        </div>
      ))}

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-10 py-5">
        <Link
          to="/"
          className="flex items-center gap-1 font-['Abhaya_Libre'] font-extrabold text-[32px] text-white leading-none"
        >
          Ch<ChoosyIcon />sy
        </Link>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-[Poppins] font-semibold text-white text-[16px]"
              style={{ background: 'linear-gradient(135deg, #CE9FFC, #7367F0)' }}
            >
              {initials}
            </div>
            <span className="font-[Poppins] text-[14px] text-white hidden sm:block" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail}
            </span>
            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className={cn('transition-transform', dropdownOpen && 'rotate-180')}>
              <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-14 w-44 rounded-2xl overflow-hidden font-[Poppins] text-[14px]"
              style={{ background: 'rgba(30,20,50,0.95)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}
            >
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                style={{ color: '#ff7c7c' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-10 px-6 pt-20">
        <div className="text-center">
          <p className="font-[Poppins] text-[14px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            ready to choose?
          </p>
          <h1
            className="font-['Abril_Fatface'] text-[64px] text-transparent leading-none"
            style={{ WebkitTextStroke: '1.5px white' }}
          >
            Pick Your Movie
          </h1>
        </div>

        {/* Cards */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Create room */}
          <div
            className="flex flex-col items-center gap-5 rounded-3xl p-8 w-72"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(206,159,252,0.3), rgba(115,103,240,0.3))', border: '1px solid rgba(206,159,252,0.3)' }}
            >
              <FilmIcon />
            </div>
            <div className="text-center">
              <h2 className="font-['Abril_Fatface'] text-[26px] text-white leading-none mb-2">Create Room</h2>
              <p className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Start a new session and invite friends to vote
              </p>
            </div>
            <button
              onClick={handleCreateRoom}
              className="w-full flex items-center justify-center font-[Poppins] font-semibold text-[16px] rounded-2xl text-white"
              style={{ height: '50px', background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)' }}
            >
              Create
            </button>
          </div>

          {/* Join room */}
          <div
            className="flex flex-col items-center gap-5 rounded-3xl p-8 w-72"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(206,159,252,0.3), rgba(115,103,240,0.3))', border: '1px solid rgba(206,159,252,0.3)' }}
            >
              <FilmIconSecondary />
            </div>
            <div className="text-center">
              <h2 className="font-['Abril_Fatface'] text-[26px] text-white leading-none mb-2">Join Room</h2>
              <p className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Enter a room code to join your friends
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <input
                type="text"
                placeholder="Room code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full text-center font-[Poppins] font-semibold text-[18px] tracking-widest"
                style={{
                  height: '50px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => setShowJoin(true)}
                disabled={!joinCode.trim()}
                className="w-full flex items-center justify-center font-[Poppins] font-semibold text-[16px] rounded-2xl text-white transition-opacity disabled:opacity-40"
                style={{ height: '50px', background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)' }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Room modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div
            className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-6"
            style={{ background: 'rgba(20,12,40,0.98)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <h3 className="font-['Abril_Fatface'] text-[32px] text-white">Room Created!</h3>
            <p className="font-[Poppins] text-[13px] text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Share this code with your friends
            </p>
            <div
              className="px-8 py-4 rounded-2xl font-[Poppins] font-bold text-[36px] tracking-[0.3em] text-white"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(206,159,252,0.4)', letterSpacing: '0.3em' }}
            >
              {createdCode}
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => { navigator.clipboard.writeText(createdCode) }}
                className="flex-1 flex items-center justify-center font-[Poppins] text-[15px] rounded-2xl text-white"
                style={{ height: '48px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Copy Code
              </button>
              <button
                onClick={() => { setShowCreate(false); navigate(`/room/${createdCode}`) }}
                className="flex-1 flex items-center justify-center font-[Poppins] font-semibold text-[15px] rounded-2xl text-white"
                style={{ height: '48px', background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)' }}
              >
                Start
              </button>
            </div>
            <button onClick={() => setShowCreate(false)} className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Join Room confirm modal */}
      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div
            className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-6"
            style={{ background: 'rgba(20,12,40,0.98)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <h3 className="font-['Abril_Fatface'] text-[32px] text-white">Joining Room</h3>
            <div
              className="px-8 py-4 rounded-2xl font-[Poppins] font-bold text-[36px] text-white"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(206,159,252,0.4)', letterSpacing: '0.3em' }}
            >
              {joinCode}
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowJoin(false)}
                className="flex-1 flex items-center justify-center font-[Poppins] text-[15px] rounded-2xl text-white"
                style={{ height: '48px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Back
              </button>
              <button
                onClick={handleJoinRoom}
                className="flex-1 flex items-center justify-center font-[Poppins] font-semibold text-[15px] rounded-2xl text-white"
                style={{ height: '48px', background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)' }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
