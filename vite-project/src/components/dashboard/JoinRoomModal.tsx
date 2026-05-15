import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ROUTES } from '../../lib/routes'

interface JoinRoomModalProps {
  code: string
  onClose: () => void
}

export const JoinRoomModal: FC<JoinRoomModalProps> = ({ code, onClose }) => {
  const navigate = useNavigate()

  return (
    <Modal onClose={onClose}>
      <h3 className="font-['Abril_Fatface'] text-[32px] text-white">Joining Room</h3>
      <div
        className="px-8 py-4 rounded-2xl font-[Poppins] font-bold text-[36px] text-white"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(206,159,252,0.4)',
          letterSpacing: '0.3em',
        }}
      >
        {code}
      </div>
      <div className="flex gap-3 w-full">
        <Button variant="ghost" fullWidth onClick={onClose}>
          Back
        </Button>
        <Button
          fullWidth
          onClick={() => {
            onClose()
            navigate(ROUTES.ROOM(code))
          }}
        >
          Join
        </Button>
      </div>
    </Modal>
  )
}
