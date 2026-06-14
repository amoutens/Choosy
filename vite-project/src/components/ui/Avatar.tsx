import { FC } from 'react'

interface AvatarProps {
  email: string
  src?: string | null
  size?: 'sm' | 'lg'
}

const sizes = {
  sm: 'w-10 h-10 text-[16px]',
  lg: 'w-20 h-20 text-[32px]',
}

export const Avatar: FC<AvatarProps> = ({ email, src, size = 'sm' }) => {
  if (src) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden flex-shrink-0`}>
        <img src={src} alt="avatar" className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-poppins font-bold text-white flex-shrink-0`}
      style={{ background: 'linear-gradient(135deg, #CE9FFC, #7367F0)' }}
    >
      {email ? email[0].toUpperCase() : '?'}
    </div>
  )
}
