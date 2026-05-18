import { FC } from 'react'

export const Spinner: FC = () => (
  <div
    className="w-10 h-10 rounded-full border-2 animate-spin"
    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }}
  />
)
