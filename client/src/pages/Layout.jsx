import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, Outlet } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useUser, RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';


const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);

  return (
    <>
      {/* Public/Unauthenticated Content */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      {/* Private/Authenticated Content */}
      <SignedIn>
        <div className='flex h-screen'>
          {/* Sidebar and main content (same as before) */}
          <div className='hidden sm:block w-60 bg-white border-r border-gray-200'>
            <Sidebar />
          </div>

          {sidebar && (
            <div className='sm:hidden fixed inset-0 z-20'>
              <div className='absolute inset-0 bg-black bg-opacity-50' onClick={() => setSidebar(false)}></div>
              <div className='relative w-60 bg-white h-full'>
                <Sidebar />
              </div>
            </div>
          )}

          <div className='flex-1 flex flex-col overflow-hidden'>
            <nav className="w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200 bg-white shadow-md sticky top-0 z-10">
              <img 
                src={assets.logo} 
                alt="Logo" 
                onClick={() => navigate('/')} 
                className='cursor-pointer h-8'
              />
              
              <div className='sm:hidden'>
                {sidebar ? (
                  <X onClick={() => setSidebar(false)} className='w-6 h-6 text-gray-600 cursor-pointer' />
                ) : (
                  <Menu onClick={() => setSidebar(true)} className='w-6 h-6 text-gray-600 cursor-pointer' />
                )}
              </div>
            </nav>

            <div className='flex-1 bg-[#f8f9fa] overflow-auto'>
              <Outlet />
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
};

export default Layout;