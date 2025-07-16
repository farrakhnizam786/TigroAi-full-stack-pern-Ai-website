import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
    const navigate = useNavigate();
    const { isLoaded, user } = useUser();
    const { openSignIn } = useClerk();

    // Show loading state while Clerk initializes
    if (!isLoaded) {
        return (
            <div className="fixed z-50 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32">
                <img 
                    src={assets.logo} 
                    alt="Logo" 
                    className='w-32 sm:w-44 cursor-pointer'
                    onClick={() => navigate('/')}
                />
                <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="fixed z-50 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32">
            <img 
                src={assets.logo} 
                alt="Logo" 
                className='w-32 sm:w-44 cursor-pointer'
                onClick={() => navigate('/')}
            />

            {user ? (
                <div className="flex items-center gap-4">
                    <button 
                        className='flex items-center gap-2 rounded-full text-sm bg-primary text-white px-6 py-2 hover:bg-primary-dark'
                        onClick={() => navigate('/ai')}
                    >
                        Dashboard <ArrowRight className='w-4 h-4' />
                    </button>
                    <UserButton afterSignOutUrl="/" />
                </div>
            ) : (
                <button 
                    className='flex items-center gap-2 rounded-full text-sm bg-primary text-white px-6 py-2 hover:bg-primary-dark'
                    onClick={() => openSignIn()}
                >
                    Get started <ArrowRight className='w-4 h-4' />
                </button>
            )}
        </div>
    );
};

export default Navbar;