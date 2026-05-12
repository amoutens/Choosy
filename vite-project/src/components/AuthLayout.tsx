import { FC, ReactNode } from 'react'
import FilmIcon from '../assets/icons/FilmIcon'
import FilmIconSecondary from '../assets/icons/FilmIconSecondary'
import ChoosyIcon from '../assets/icons/ChoosyIcon'
import { Link } from 'react-router-dom'

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

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
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

      {/* Logo top-left */}
      <Link
        to="/"
        className="absolute top-6 left-8 z-20 flex items-center gap-1 font-['Abhaya_Libre'] font-extrabold text-[32px] text-white leading-none"
      >
        Ch<ChoosyIcon />sy
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md" style={{ backdropFilter: 'blur(16px)' }}>
        <div
          className="rounded-3xl p-10"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
