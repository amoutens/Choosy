import { FC } from 'react'
import { Link } from 'react-router-dom'
import ChoosyIcon from '../assets/icons/ChoosyIcon'
import FilmIcon from '../assets/icons/FilmIcon'
import FilmIconSecondary from '../assets/icons/FilmIconSecondary'
import ArrowHome from '../assets/icons/ArrowHome'
import { cn } from '../lib/utils'

const bgIcons: { type: 'reel' | 'strip'; style: React.CSSProperties }[] = [
  { type: 'reel',  style: { top: '5%', left: '5%' } },
  { type: 'strip', style: { top: '10%', left: '20%', transform: 'rotate(30deg)' } },
  { type: 'reel',  style: { top: '8%', left: '40%' } },
  { type: 'strip', style: { top: '7%', left: '60%', transform: 'rotate(-20deg)' } },
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

const Home: FC = () => {
  return (
    <div className={cn('min-h-screen flex items-center justify-center p-6 relative')}>
      <div className={cn('absolute inset-0 flex items-center justify-center z-0 pointer-events-none')}>
        <div
          className="absolute rounded-[50%]"
          style={{ width: '800px', height: '300px', background: '#9378F4', opacity: 0.76, filter: 'blur(90px)' }}
        />
      </div>

      {bgIcons.map((icon, i) => (
        <div key={i} className={cn('absolute pointer-events-none opacity-90')} style={icon.style}>
          {icon.type === 'reel' ? <FilmIcon /> : <FilmIconSecondary />}
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="text-center">
          <h1
            className="font-['Abril_Fatface'] text-[116px] text-transparent leading-none"
            style={{ WebkitTextStroke: '2px white' }}
          >
            Don't Argue
          </h1>
          <h2 className="font-['Abhaya_Libre'] font-extrabold text-[128px] text-white flex justify-center items-center leading-none mt-[-20px]">
            Ch<ChoosyIcon />sy It
          </h2>
        </div>
      </div>

      <div
        className="absolute inset-x-0 z-10 flex flex-col items-center gap-3"
        style={{ top: 'calc(50% + 130px)' }}
      >
        <div className="relative pointer-events-none" style={{ width: '340px', height: '110px' }}>
          <div className="absolute" style={{ right: '20px', top: '0' }}>
            <ArrowHome />
          </div>
        </div>
        <Link
          to="/register"
          className="flex items-center justify-center font-[Poppins] font-semibold text-[28px] rounded-2xl"
          style={{ width: '300px', height: '80px', background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)', color: '#ffffff' }}
        >
          Get Started
        </Link>
      </div>
    </div>
  )
}

export default Home
