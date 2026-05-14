import { FC, ReactNode } from 'react'
import FilmIcon from '../assets/icons/FilmIcon'
import FilmIconSecondary from '../assets/icons/FilmIconSecondary'
import { BG_ICONS } from '../lib/constants'

interface PageBackgroundProps {
  children: ReactNode
  className?: string
}

export const PageBackground: FC<PageBackgroundProps> = ({ children, className = '' }) => (
  <div className={`min-h-screen relative overflow-hidden ${className}`}>
    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
      <div
        className="absolute rounded-[50%]"
        style={{ width: '800px', height: '300px', background: '#9378F4', opacity: 0.76, filter: 'blur(90px)' }}
      />
    </div>

    {BG_ICONS.map((icon, i) => (
      <div key={i} className="absolute pointer-events-none opacity-90" style={icon.style}>
        {icon.type === 'reel' ? <FilmIcon /> : <FilmIconSecondary />}
      </div>
    ))}

    {children}
  </div>
)
