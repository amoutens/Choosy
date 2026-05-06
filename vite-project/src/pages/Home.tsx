import { FC } from 'react'
import { Link } from 'react-router-dom'
import ChoosyIcon from '../assets/icons/ChoosyIcon'

const Home: FC = () => {
  return (
    <div className="min-h-screen  flex items-center justify-center p-6">
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div
          className="absolute rounded-[50%]"
          style={{
            width: '800px',
            height: '300px',
            background: '#9378F4',
            opacity: 0.76,
            filter: 'blur(90px)',
          }}
        />
      </div>
      <div className="w-full max-w-4xl text-center relative">
       

        <h1 className="font-['Abril_Fatface'] text-[116px] text-transparent z-10" style={{ WebkitTextStroke: '2px white' }}>Don't Argue</h1>
        <h2 className="font-['Abhaya_Libre'] font-extrabold text-[128px] text-white mt-1 z-10 flex justify-center items-center">Ch
            <ChoosyIcon />
          sy It</h2>

        <p className="mt-8 z-10">
          <Link to="/other" className="inline-block px-8 py-3 rounded-full text-white font-medium bg-gradient-to-r from-purple-300 to-choosyPurple">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Home
