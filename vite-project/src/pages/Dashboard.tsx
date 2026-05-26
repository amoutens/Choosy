import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageBackground } from '../components/PageBackground'
import { Logo } from '../components/Logo'
import { UserMenu } from '../components/UserMenu'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { RoomCard } from '../components/dashboard/RoomCard'
import { CreateRoomModal } from '../components/dashboard/CreateRoomModal'
import { JoinRoomModal } from '../components/dashboard/JoinRoomModal'
import { Button } from '../components/ui/Button'
import FilmIcon from '../assets/icons/FilmIcon'
import FilmIconSecondary from '../assets/icons/FilmIconSecondary'
import { useRequireAuth, logout } from '../lib/token'
import { ROUTES } from '../lib/routes'
import { createRoom } from '../api/rooms'

const Dashboard: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useRequireAuth()

  const [showCreate, setShowCreate] = useState(false)
  const [createdCode, setCreatedCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  const handleCreateRoom = async () => {
    setIsCreating(true)
    try {
      const { code } = await createRoom()
      setCreatedCode(code)
      setShowCreate(true)
    } catch {
      // silently ignore — user stays on dashboard
    } finally {
      setIsCreating(false)
    }
  }

  if (!user) return null

  return (
    <PageBackground>
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-10 py-5">
        <Logo />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserMenu email={user.email} userId={user.sub} onLogout={() => logout(navigate)} />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-10 px-6 pt-20">
        <div className="text-center">
          <p className="font-[Poppins] text-[14px] mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {t('dashboard.subtitle')}
          </p>
          <h1
            className="font-['Abril_Fatface'] text-[64px] text-transparent leading-none"
            style={{ WebkitTextStroke: '1.5px white' }}
          >
            {t('dashboard.title')}
          </h1>
        </div>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigate(ROUTES.SWIPE)}
          style={{ paddingLeft: 32, paddingRight: 32, gap: 10 }}
        >
          <span style={{ fontSize: 20 }}>🎬</span> {t('dashboard.soloSwipe')}
        </Button>

        <div className="flex flex-col sm:flex-row gap-6">
          <RoomCard
            icon={<FilmIcon />}
            title={t('dashboard.createRoom')}
            description={t('dashboard.createRoomDesc')}
            onAction={handleCreateRoom}
            actionLabel={isCreating ? t('dashboard.creating') : t('dashboard.create')}
          />

          <RoomCard
            icon={<FilmIconSecondary />}
            title={t('dashboard.joinRoom')}
            description={t('dashboard.joinRoomDesc')}
          >
            <div className="w-full flex flex-col gap-3">
              <input
                type="text"
                placeholder={t('dashboard.roomCodePlaceholder')}
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
                {t('dashboard.join')}
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
