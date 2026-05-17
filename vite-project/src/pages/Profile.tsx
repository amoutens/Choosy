import { FC, useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { useRequireAuth, logout } from '../lib/token'
import { compressImage } from '../lib/avatarStorage'
import { fetchMyProfile, uploadAvatar, deleteAvatar, updateName } from '../api/users'
import { ROUTES } from '../lib/routes'

const Profile: FC = () => {
  const navigate = useNavigate()
  const user = useRequireAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState<string>('')
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    if (!user) return
    fetchMyProfile()
      .then((p) => {
        setAvatarSrc(p.avatar)
        setName(p.name ?? '')
      })
      .catch(() => {})
  }, [user])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await compressImage(file)
    setPreview(dataUrl)
    setError('')
  }

  const withSaving = async (fn: () => Promise<void>, errMsg: string) => {
    setSaving(true)
    setError('')
    try {
      await fn()
    } catch {
      setError(errMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => {
    if (!preview) return
    withSaving(async () => {
      await uploadAvatar(preview)
      setAvatarSrc(preview)
      setPreview(null)
    }, 'Failed to save. Try again.')
  }

  const handleRemove = () =>
    withSaving(async () => {
      await deleteAvatar()
      setAvatarSrc(null)
      setPreview(null)
    }, 'Failed to remove. Try again.')

  const handleNameEdit = () => {
    setNameInput(name)
    setEditingName(true)
  }

  const handleNameSave = () =>
    withSaving(async () => {
      await updateName(nameInput.trim())
      setName(nameInput.trim())
      setEditingName(false)
    }, 'Failed to save name. Try again.')

  if (!user) return null

  const displaySrc = preview ?? avatarSrc

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-3 mb-8">
        <div
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar email={user.email} src={displaySrc} size="lg" />
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="font-[Poppins] text-[13px] px-4 py-1.5 rounded-xl text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(to bottom, #CE9FFC, #7367F0)' }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => {
                setPreview(null)
                setError('')
              }}
              disabled={saving}
              className="font-[Poppins] text-[13px] px-4 py-1.5 rounded-xl disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
            >
              Cancel
            </button>
          </div>
        ) : avatarSrc ? (
          <button
            onClick={handleRemove}
            disabled={saving}
            className="font-[Poppins] text-[12px] disabled:opacity-50"
            style={{ color: '#ff7c7c' }}
          >
            {saving ? 'Removing…' : 'Remove photo'}
          </button>
        ) : (
          <p className="font-[Poppins] text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Click to upload photo
          </p>
        )}

        {error && (
          <p className="font-[Poppins] text-[12px]" style={{ color: '#ff7c7c' }}>
            {error}
          </p>
        )}

        <p className="font-[Poppins] text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ID: {user.sub}
        </p>
      </div>

      <h2
        className="font-['Abril_Fatface'] text-[42px] text-transparent leading-none mb-6"
        style={{ WebkitTextStroke: '1.5px white' }}
      >
        My Profile
      </h2>

      <div className="flex flex-col gap-3 mb-8">
        <div
          className="rounded-2xl px-4 py-4"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="font-[Poppins] text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Name
            </p>
            {!editingName && (
              <button
                onClick={handleNameEdit}
                className="font-[Poppins] text-[11px] hover:opacity-70 transition-opacity"
                style={{ color: '#CE9FFC' }}
              >
                Edit
              </button>
            )}
          </div>
          {editingName ? (
            <div className="flex gap-2 items-center">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="flex-1 font-[Poppins] text-[15px] text-white bg-transparent border-b outline-none"
                style={{ borderColor: 'rgba(206,159,252,0.5)' }}
              />
              <button
                onClick={handleNameSave}
                disabled={saving}
                className="font-[Poppins] text-[12px] px-3 py-1 rounded-xl disabled:opacity-50"
                style={{
                  background: 'linear-gradient(to bottom, #CE9FFC, #7367F0)',
                  color: '#fff',
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingName(false)}
                disabled={saving}
                className="font-[Poppins] text-[12px] px-3 py-1 rounded-xl disabled:opacity-50"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="font-[Poppins] text-[15px] text-white">
              {name || <span style={{ color: 'rgba(255,255,255,0.3)' }}>Not set</span>}
            </p>
          )}
        </div>

        <div
          className="rounded-2xl px-4 py-4"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <p className="font-[Poppins] text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Email
          </p>
          <p className="font-[Poppins] text-[15px] text-white">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center justify-center font-[Poppins] font-semibold text-[16px] rounded-2xl text-white"
          style={{
            height: '50px',
            background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)',
          }}
        >
          Back to Dashboard
        </Link>
        <Button variant="danger" fullWidth onClick={() => logout(navigate)}>
          Log Out
        </Button>
      </div>
    </AuthLayout>
  )
}

export default Profile
