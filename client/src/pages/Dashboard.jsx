import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Sparkle, TrendingUp, Crown } from 'lucide-react';
import CreationsItem from '../components/CreationsItem';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState('Free');
  const [freeUsage, setFreeUsage] = useState(0);
  const { getToken } = useAuth();
  const { user } = useUser();

  const isPremium = plan === 'Premium';

  const getAuthHeader = async () => ({
    Authorization: `Bearer ${await getToken()}`
  });

  const getDashboardData = async () => {
    try {
      const headers = await getAuthHeader();

      // Fetch creations and plan in parallel
      const [creationsRes, planRes] = await Promise.all([
        axios.get('/api/user/get-user-creations', { headers }),
        axios.get('/api/user/get-user-plan', { headers }),
      ]);

      if (creationsRes.data.success) {
        setCreations(creationsRes.data.creations);
      } else {
        toast.error(creationsRes.data.message);
      }

      if (planRes.data.success) {
        setPlan(planRes.data.plan === 'Premium' ? 'Premium' : 'Free');
        setFreeUsage(planRes.data.free_usage || 0);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const imageCount = creations.filter(c => c.type === 'image').length;
  const textCount = creations.filter(c => c.type !== 'image').length;

  return (
    <div className='h-full p-6 overflow-y-auto'>

      {/* Welcome Banner */}
      <div className='mb-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-5 text-white shadow-lg flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
          </h1>
          <p className='text-violet-200 text-sm mt-1'>Here's what you've created so far</p>
        </div>
        <div className='hidden sm:flex w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center'>
          <Sparkle className='w-7 h-7 text-white' />
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 mb-7'>
        {/* Total Creations */}
        <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between mb-3'>
            <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow'>
              <Sparkle className='h-4 w-4 text-white' />
            </div>
            <span className='text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full'>All</span>
          </div>
          <p className='text-2xl font-bold text-gray-800'>{creations.length}</p>
          <p className='text-xs text-gray-500 mt-0.5'>Total Creations</p>
        </div>

        {/* Images Created */}
        <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
          <div className='flex items-center justify-between mb-3'>
            <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow'>
              <TrendingUp className='h-4 w-4 text-white' />
            </div>
            <span className='text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full'>Images</span>
          </div>
          <p className='text-2xl font-bold text-gray-800'>{imageCount}</p>
          <p className='text-xs text-gray-500 mt-0.5'>Images Generated</p>
        </div>

        {/* ✅ Plan — read from server's auth middleware, not from Clerk frontend */}
        <div className='bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow col-span-2 sm:col-span-1'>
          <div className='flex items-center justify-between mb-3'>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow bg-gradient-to-br ${isPremium ? 'from-amber-400 to-orange-500' : 'from-gray-400 to-gray-500'}`}>
              <Crown className='h-4 w-4 text-white' />
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isPremium ? 'text-amber-600 bg-amber-50' : 'text-gray-500 bg-gray-100'}`}>
              Plan
            </span>
          </div>
          <p className='text-2xl font-bold text-gray-800'>{plan}</p>
          <p className='text-xs text-gray-500 mt-0.5'>
            {isPremium ? 'Unlimited access' : `${freeUsage}/10 free uses`}
          </p>
        </div>
      </div>

      {/* Creations List */}
      <div>
        <div className='flex items-center justify-between mb-4'>
          <p className='text-base font-semibold text-gray-800'>Recent Creations</p>
          <span className='text-xs text-gray-400'>{creations.length} items</span>
        </div>

        {loading ? (
          <div className='flex flex-col items-center justify-center h-40 gap-3'>
            <div className='w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin' />
            <p className='text-sm text-gray-500'>Loading your creations…</p>
          </div>
        ) : creations.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-40 gap-2 text-gray-400'>
            <Sparkle className='w-10 h-10' />
            <p className='text-sm'>No creations yet. Go make something awesome!</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {creations.map((item) => (
              <CreationsItem key={item.id} item={item} onRefresh={getDashboardData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;