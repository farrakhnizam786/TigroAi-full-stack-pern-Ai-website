import React, { useState, useEffect } from 'react';
import { Protect, useAuth, useUser } from '@clerk/clerk-react';
import { dummyCreationData } from '../assets/assets';
import { Sparkle } from 'lucide-react';
import CreationsItem from '../components/CreationsItem'; // Make sure path and filename match exactly
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();

  const getDashboardData = async ()=> {
    try {
      const { data }= await axios.get('/api/user/get-user-creations',{
        headers : {Authorization : `Bearer ${await getToken()}`}
      })
        if (data.success) {
          setCreations(data.creations)
        }else {
          toast.error(data.message)
        }

      
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }


  useEffect(() => {
    setCreations(dummyCreationData); //dummy data 
    getDashboardData()
  }, []);

  return (
    <div className="h-full p-6">
      {/* Dashboard Content */}
      <div>
        <h1 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Stats Card */}
        <div className="flex gap-4">
          <div className="bg-white p-5 w-64 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total creations</p>
                <p className="text-2xl font-bold mt-1">{creations.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                <Sparkle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 w-64 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Active Plan</p>
                <p className="text-2xl font-bold mt-1">
                  <Protect role="org:admin" fallback="Free">
                    Premium
                  </Protect>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-yellow-500 flex items-center justify-center shadow-md">
                <Sparkle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
        {
          loading ? (
                <div className='flex justify-around items-center h-3/4/'>
                  <div className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent border-white animate-spin'>

                  </div>
                </div>
          ): (
      <div className='space-y-3 mt-6'>
        <p className='text-lg font-medium mb-4'>Recent Creations</p> 
        {creations.map((item) => (
          <CreationsItem key={item.id} item={item} />
        ))}
      </div>

          )
        }
    </div>
  );
};

export default Dashboard;