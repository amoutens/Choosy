import { FC, ReactNode } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { Button } from '../ui/Button'

interface RoomCardProps {
  icon: ReactNode
  title: string
  description: string
  children?: ReactNode
  onAction?: () => void
  actionLabel?: string
}

export const RoomCard: FC<RoomCardProps> = ({ icon, title, description, children, onAction, actionLabel }) => (
  <GlassCard className="flex flex-col items-center gap-5 w-72">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, rgba(206,159,252,0.3), rgba(115,103,240,0.3))',
        border: '1px solid rgba(206,159,252,0.3)',
      }}
    >
      {icon}
    </div>

    <div className="text-center">
      <h2 className="font-['Abril_Fatface'] text-[26px] text-white leading-none mb-2">{title}</h2>
      <p className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{description}</p>
    </div>

    {children ?? (
      <Button fullWidth onClick={onAction}>{actionLabel}</Button>
    )}
  </GlassCard>
)
