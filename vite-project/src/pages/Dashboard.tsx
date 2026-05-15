import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageBackground } from '../components/PageBackground'
import { Logo } from '../components/Logo'
import { UserMenu } from '../components/UserMenu'
import { RoomCard } from '../components/dashboard/RoomCard'
import { CreateRoomModal } from '../components/dashboard/CreateRoomModal'
import { JoinRoomModal } from '../components/dashboard/JoinRoomModal'
import { Button } from '../components/ui/Button'
import FilmIcon from '../assets/icons/FilmIcon'
import FilmIconSecondary from '../assets/icons/FilmIconSecondary'
import { useRequireAuth, logout } from '../lib/token'

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const Dashboard: FC = () => {
  const navigate = useNavigate()
  const user = useRequireAuth()

  const [showCreate, setShowCreate] = useState(false)
  const [createdCode, setCreatedCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  const handleCreateRoom = () => {
    setCreatedCode(generateRoomCode())
    setShowCreate(true)
  }

  if (!user) return null

  return (
    <PageBackground>
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-10 py-5">
        <Logo />
        <UserMenu email={user.email} userId={user.sub} onLogout={() => logout(navigate)} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-10 px-6 pt-20">
        <div className="text-center">
          <p className="font-[Poppins] text-[14px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            ready to choose?
          </p>
          <h1
            className="font-['Abril_Fatface'] text-[64px] text-transparent leading-none"
            style={{ WebkitTextStroke: '1.5px white' }}
          >
            Pick Your Movie
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <RoomCard
            icon={<FilmIcon />}
            title="Create Room"
            description="Start a new session and invite friends to vote"
            onAction={handleCreateRoom}
            actionLabel="Create"
          />

          <RoomCard
            icon={<FilmIconSecondary />}
            title="Join Room"
            description="Enter a room code to join your friends"
          >
            <div className="w-full flex flex-col gap-3">
              <input
                type="text"
                placeholder="Room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full text-center font-[Poppins] font-semibold text-[18px] tracking-widest"
                style={{
                  height: '50px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  outline: 'none',
                }}
              />
              <Button fullWidth disabled={!joinCode.trim()} onClick={() => setShowJoin(true)}>
                Join
              </Button>
            </div>
          </RoomCard>
        </div>
      </div>

      {showCreate && <CreateRoomModal code={createdCode} onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinRoomModal code={joinCode} onClose={() => setShowJoin(false)} />}
    </PageBackground>
  )
}

export default Dashboard
