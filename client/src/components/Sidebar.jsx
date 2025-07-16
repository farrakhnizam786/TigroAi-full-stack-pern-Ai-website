import React from 'react';
import { useUser, useClerk, Protect } from '@clerk/clerk-react';
import { Eraser, Hash, House, Scissors, SquarePen, Users, Image, File, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navitems = [
  { to: '/ai', label: 'Dashboard', icon: House },
  { to: '/ai/write-article', label: 'Write Article', icon: SquarePen },
  { to: '/ai/blog-titles', label: 'Blog Titles', icon: Hash },
  { to: '/ai/generate-images', label: 'Generate Images', icon: Image },
  { to: '/ai/remove-object', label: 'Remove Object', icon: Eraser },
  { to: '/ai/remove-background', label: 'Remove Background', icon: Scissors },
  { to: '/ai/review-resumes', label: 'Review Resumes', icon: File },
  { to: '/ai/community', label: 'Community', icon: Users }
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <div className={`w-60 bg-white border-r border-gray-200 flex flex-col h-screen max-sm:fixed max-sm:top-0 max-sm:z-50 ${
      sidebar ? 'max-sm:translate-x-0' : 'max-sm:-translate-x-full'
    } max-sm:transition-transform duration-300 ease-in-out`}>
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {user && (
          <>
            {/* User Profile */}
            <div className="flex flex-col items-center px-4 mb-6">
              <img 
                src={user.imageUrl} 
                alt="User avatar" 
                className="w-16 h-16 rounded-full object-cover cursor-pointer border-2 border-purple-100"
                onClick={openUserProfile}
              />
              <h1 className="mt-3 text-center font-medium text-gray-800">{user.fullName}</h1>
              <p className="text-xs text-gray-500 mt-1">
                <Protect plan='premium' fallback={<span>Free Plan</span>}>
                  Premium Plan
                </Protect>
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 px-3">
              {navitems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    key={item.to}
                    to={item.to}
                    end={item.to === '/ai'}
                    onClick={() => setSidebar(false)}
                    className={({isActive}) => 
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#3c81F6] to-[#9234ea] text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </>
        )}
      </div>

      {/* Footer with User Info and Logout */}
      <div className="border-t border-gray-200 pt-3 pb-4 px-4">
        <div className="flex items-center justify-between">
          <div 
            onClick={openUserProfile} 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <img 
              src={user?.imageUrl} 
              className="w-8 h-8 rounded-full object-cover" 
              alt="User avatar" 
            />
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
              <p className="text-xs text-gray-500">
                <Protect plan='premium' fallback="Free Plan">Premium Plan</Protect>
              </p>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;