import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section 
      className='px-4 sm:px-20 xl:px-32 py-20 flex flex-col items-center justify-center min-h-screen w-full'
      style={{ 
        backgroundImage: `url(${assets.gradientBackground})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      <div className='text-center mt-20 max-w-4xl'>
        <h1 className='text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-semibold text-black leading-[1.2]'>
          Welcome to the Power of <span className='text-primary'>AI Tools</span>
        </h1>
        <p className='text-lg text-black mt-4'>
          Explore the power of AI with our tools and resources.
        </p>
      </div>

      <div className='mt-10 flex justify-center gap-4 flex-wrap'>
        <button 
          onClick={() => navigate('/ai')} 
          className='bg-primary text-white px-6 py-3 rounded-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-sm sm:text-base sm:px-8'
          aria-label="Start creating with AI tools"
        >
          Start Your Creation
        </button>
        <button 
          className='bg-white text-primary px-6 py-3 rounded-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-sm sm:text-base sm:px-8'
          aria-label="Watch demo"
        >
          Watch Demo
        </button>
      </div>
      
      <div className='flex items-center justify-center mt-10'>
        <img 
          src={assets.user_group}
          alt="User group" 
          className='h-8 w-auto' 
          loading="lazy"
        />
        <span className='text-black-200 text-sm ml-3'>Trusted by over 10k+ Users</span>
      </div>
    </section>
  );
};

export default Hero;