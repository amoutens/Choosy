import { FC, ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  onClose: () => void
}

export const Modal: FC<ModalProps> = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-6"
    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}
  >
    <div
      className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-6"
      style={{ background: 'rgba(20,12,40,0.98)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      {children}
    </div>
  </div>
)
