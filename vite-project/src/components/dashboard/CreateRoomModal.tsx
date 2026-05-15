import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ROUTES } from '../../lib/routes'

interface CreateRoomModalProps {
  code: string
  onClose: () => void
}

export const CreateRoomModal: FC<CreateRoomModalProps> = ({ code, onClose }) => {
  const navigate = useNavigate()

  return (
    <Modal onClose={onClose}>
      <h3 className="font-['Abril_Fatface'] text-[32px] text-white">Room Created!</h3>
      <p
        className="font-[Poppins] text-[13px] text-center"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        Share this code with your friends
      </p>
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
        <Button variant="ghost" fullWidth onClick={() => navigator.clipboard.writeText(code)}>
          Copy Code
        </Button>
        <Button
          fullWidth
          onClick={() => {
            onClose()
            navigate(ROUTES.ROOM(code))
          }}
        >
          Start
        </Button>
      </div>
      <button
        onClick={onClose}
        className="font-[Poppins] text-[13px]"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        Cancel
      </button>
    </Modal>
  )
}
