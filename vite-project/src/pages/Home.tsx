import { FC } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ChoosyIcon from '../assets/icons/ChoosyIcon'
import ArrowHome from '../assets/icons/ArrowHome'
import { PageBackground } from '../components/PageBackground'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { ROUTES } from '../lib/routes'

const Home: FC = () => {
  const { t } = useTranslation()
  return (
    <PageBackground className="flex items-center justify-center p-6">
      <div className="absolute top-6 right-8 z-20">
        <LanguageSwitcher />
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="text-center">
          <h1
            className="font-['Abril_Fatface'] text-[116px] text-transparent leading-none"
            style={{ WebkitTextStroke: '2px white' }}
          >
            {t('home.tagline')}
          </h1>
          <h2 className="font-['Abhaya_Libre'] font-extrabold text-[128px] text-white flex justify-center items-center leading-none mt-[-20px]">
            Ch
            <ChoosyIcon />
            sy It
          </h2>
        </div>
      </div>

      <div
        className="absolute inset-x-0 z-10 flex flex-col items-center gap-3"
        style={{ top: 'calc(50% + 130px)' }}
      >
        <div className="relative pointer-events-none" style={{ width: '340px', height: '110px' }}>
          <div className="absolute" style={{ right: '20px', top: '0' }}>
            <ArrowHome />
          </div>
        </div>
        <Link
          to={ROUTES.REGISTER}
          className="flex items-center justify-center font-poppins font-semibold text-[28px] rounded-2xl text-white"
          style={{
            width: '300px',
            height: '80px',
            background: 'linear-gradient(to bottom, #CE9FFC, #A582F7, #7367F0)',
          }}
        >
          {t('home.cta')}
        </Link>
      </div>
    </PageBackground>
  )
}

export default Home
