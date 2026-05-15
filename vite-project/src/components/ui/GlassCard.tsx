import { FC, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  padding?: string
}

export const GlassCard: FC<GlassCardProps> = ({ children, className, padding = 'p-8' }) => (
  <div
    className={cn('rounded-3xl', padding, className)}
    style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(16px)',
    }}
  >
    {children}
  </div>
)
