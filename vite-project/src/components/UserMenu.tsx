import { FC, useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Avatar } from './ui/Avatar'
import { cn } from '../lib/utils'
import { ROUTES } from '../lib/routes'
import { fetchMyProfile } from '../api/users'

interface UserMenuProps {
  email: string
  userId: string
  onLogout: () => void
}

export const UserMenu: FC<UserMenuProps> = ({ email, userId, onLogout }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMyProfile()
      .then((p) => {
        setAvatarSrc(p.avatar)
        setDisplayName(p.name ?? '')
      })
      .catch(() => {})
  }, [userId])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 focus:outline-none"
      >
        <Avatar email={email} src={avatarSrc} size="sm" />
        <span
          className="font-[Poppins] text-[14px] text-white hidden sm:block"
          style={{
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName || email}
        </span>
        <svg
          width="12"
          height="7"
          viewBox="0 0 12 7"
          fill="none"
          className={cn('transition-transform', open && 'rotate-180')}
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-14 w-44 rounded-2xl overflow-hidden font-[Poppins] text-[14px]"
          style={{
            background: 'rgba(30,20,50,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Link
            to={ROUTES.PROFILE}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            {t('userMenu.myProfile')}
          </Link>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
            style={{ color: '#ff7c7c' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t('userMenu.logOut')}
          </button>
        </div>
      )}
    </div>
  )
}
