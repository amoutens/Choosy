import { FC } from 'react'
import { Link } from 'react-router-dom'
import ChoosyIcon from '../assets/icons/ChoosyIcon'
import FilmIcon from '../assets/icons/FilmIcon';
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
      <div className="relative z-10">
      <div className="w-full max-w-4xl text-center relative">
       

        <h1 className="font-['Abril_Fatface'] text-[116px] text-transparent z-10 leading-none" style={{ WebkitTextStroke: '2px white' }}>Don't Argue</h1>
        <h2 className="font-['Abhaya_Libre'] font-extrabold text-[128px] text-white z-10 flex justify-center items-center leading-none">Ch
            <ChoosyIcon />
          sy It</h2>

      
      </div>
      <div className="mt-8 z-10 flex justify-center">
          <Link
            to="/other"
            className="flex items-center justify-center font-[Poppins] font-semibold text-[32px] rounded-2xl"
            style={{ width: '353px', height: '93px', background: 'linear-gradient(to right, #CE9FFC, #A582F7, #7367F0)', color: '#ffffff' }}
          >
            Get Started
          </Link>
        </div>
        </div>
      <div className="relative z-10"><FilmIcon /></div>
        
    </div>
  )
}
export default Home
