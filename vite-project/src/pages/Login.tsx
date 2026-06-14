import { FC, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { apiLogin } from '../api/auth'
import { ROUTES } from '../lib/routes'

const Login: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
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
        {t('auth.login.title')}
      </h2>
      <p className="font-poppins text-[14px] mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {t('auth.login.noAccount')}{' '}
        <Link to={ROUTES.REGISTER} className="underline" style={{ color: '#A582F7' }}>
          {t('auth.login.signUp')}
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label={t('auth.login.email')}
          type="email"
          placeholder={t('auth.login.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          label={t('auth.login.password')}
          type="password"
          placeholder={t('auth.login.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="font-poppins text-[13px] text-center" style={{ color: '#ff7c7c' }}>
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={loading} className="mt-2">
          {loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default Login
