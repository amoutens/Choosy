import { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const LanguageSwitcher: FC = () => {
  const { i18n } = useTranslation()
  const current = i18n.language

  const toggle = (lang: string) => {
    if (lang !== current) void i18n.changeLanguage(lang)
  }

  return (
    <div
      className="flex items-center rounded-xl overflow-hidden font-poppins text-[12px] font-semibold"
      style={{ border: '1px solid rgba(255,255,255,0.15)' }}
    >
      {(['uk', 'en'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => toggle(lang)}
          className="px-3 py-1.5 transition-all cursor-pointer"
          style={
            current === lang
              ? { background: 'rgba(206,159,252,0.25)', color: '#CE9FFC' }
              : { background: 'transparent', color: 'rgba(255,255,255,0.35)' }
          }
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
