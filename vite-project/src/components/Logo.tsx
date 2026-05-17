import { FC } from 'react'
import { Link } from 'react-router-dom'
import ChoosynLogo from '../assets/ChoosynLogo'
import { ROUTES } from '../lib/routes'

interface LogoProps {
  className?: string
}

export const Logo: FC<LogoProps> = ({ className = '' }) => (
  <Link to={ROUTES.HOME} className={`focus:outline-none ${className}`}>
    <ChoosynLogo />
  </Link>
)
