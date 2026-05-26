import { FC, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { apiRegister } from '../api/auth'
import { ROUTES } from '../lib/routes'

const Register: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiRegister(email, password, name || undefined)
      localStorage.setItem('token', data.access_token)
      navigate(ROUTES.DASHBOARD)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.somethingWentWrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2
        className="font-['Abril_Fatface'] text-[42px] text-transparent leading-none mb-1"
        style={{ WebkitTextStroke: '1.5px white' }}
      >
        {t('auth.register.title')}
      </h2>
      <p className="font-[Poppins] text-[14px] mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {t('auth.register.hasAccount')}{' '}
        <Link to={ROUTES.LOGIN} className="underline" style={{ color: '#A582F7' }}>
          {t('auth.register.signIn')}
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label={t('auth.register.name')}
          type="text"
          placeholder={t('auth.register.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label={t('auth.register.email')}
          type="email"
          placeholder={t('auth.register.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label={t('auth.register.password')}
          type="password"
          placeholder={t('auth.register.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="font-[Poppins] text-[13px] text-center" style={{ color: '#ff7c7c' }}>
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
          {loading ? t('auth.register.creating') : t('auth.register.signUp')}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default Register
