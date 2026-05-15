import { FC, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'gradient' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const variantStyles: Record<string, React.CSSProperties> = {
  gradient: { background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)' },
  ghost: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' },
  danger: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#ff7c7c',
  },
}

const sizeStyles: Record<string, { height: string; fontSize: string }> = {
  sm: { height: '40px', fontSize: '14px' },
  md: { height: '50px', fontSize: '16px' },
  lg: { height: '56px', fontSize: '18px' },
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'gradient',
  size = 'md',
  fullWidth = false,
  className,
  style,
  ...props
}) => (
  <button
    className={cn(
      'flex items-center justify-center font-[Poppins] font-semibold rounded-2xl text-white transition-opacity disabled:opacity-60',
      fullWidth && 'w-full',
      className
    )}
    style={{ ...sizeStyles[size], ...variantStyles[variant], ...style }}
    {...props}
  >
    {children}
  </button>
)
