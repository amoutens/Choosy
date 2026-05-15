import { FC } from 'react'
import { Link } from 'react-router-dom'
import ChoosyIcon from '../assets/icons/ChoosyIcon'
import { ROUTES } from '../lib/routes'

interface LogoProps {
  className?: string
}

export const Logo: FC<LogoProps> = ({ className = '' }) => (
  <Link
    to={ROUTES.HOME}
    className={`flex items-center gap-1 font-['Abhaya_Libre'] font-extrabold text-[32px] text-white leading-none ${className}`}
  >
    Ch
    <ChoosyIcon />
    sy
  </Link>
)
