import { FC, ReactNode } from 'react'
import { PageBackground } from './PageBackground'
import { Logo } from './Logo'
import { GlassCard } from './ui/GlassCard'
import { LanguageSwitcher } from './LanguageSwitcher'

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => (
  <PageBackground className="flex items-center justify-center p-6">
    <Logo className="absolute top-6 left-8 z-20" />
    <div className="absolute top-6 right-8 z-20">
      <LanguageSwitcher />
    </div>
    <div className="relative z-10 w-full max-w-md">
      <GlassCard padding="p-10">{children}</GlassCard>
    </div>
  </PageBackground>
)

export default AuthLayout
