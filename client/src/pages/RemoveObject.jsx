import { useAuth } from '@clerk/clerk-react';
import { Eraser, Scissors, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios'
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState('');
  const [object, setObject] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();
            
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // Handle form submission
    try {
      if (!input) {
        toast.error('No file selected.');
        return;
      }

      setLoading(true);
      setContent('');
    if (object.trim().split(/\s+/).length > 1) {
  return toast.error('Please enter only one object name');
}


      const formData = new FormData();
      formData.append('image', input)
      formData.append('object', object)

      const { data } = await axios.post(
        'http://localhost:3000/api/ai/remove-object',
        formData,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      ); 

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message || 'Failed to remove background');
      }
    } catch (error) {
      toast.error(error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-6 text-slate-900 dark:text-slate-200'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 flex flex-col gap-6 rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-lg'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 h-6 text-[#4a7aff]' />
          <h1 className='text-xl font-semibold'>Ai Object Removal</h1>
        </div>
        
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Upload Image</label>
          <input
            type="file" 
            className='border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none text-sm text-gray-600' 
            accept='image/*'
            onChange={(e) => setInput(e.target.files[0])}
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Describe object name to remove</label>
          <textarea 
            className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#f6ab41] to-[#04ff50] rounded-lg p-2 outline-none text-sm' 
            placeholder='e.g.,watch or spoon,Only single object name'
            value={object}
            onChange={(e) => setObject(e.target.value)}
            rows={4}
            required
          />
        </div>

        <button disabled={loading} type="submit" className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#f6ab41] to-[#04ff50] px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors'>
          {loading ? (
                      <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent border-white animate-spin'></span>
                    ) : (

          <Scissors className='w-5 h-5 inline mr-2' />
                    )}
          Remove Object
        </button>
      </form>

      <div className='w-full flex-1 min-w-lg bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-lg min-h-96 overflow-y-auto'>
        <div className='text-sm text-gray-500 gap-3'>
          <Scissors className='text-[#4a7aff] w-4 h-5' />
          <h1 className='text-xl font-semibold'>Object removed</h1>
        </div>
        {
          !content ? (

        <div className='flex-1 flex justify-center items-center'>
          <div className='text-gray-400 gap-5 flex flex-col items-center'>
            <Scissors className='w-9 h-9' />
            <p className='text-sm'>Once your file uploaded just click to "Remove Object".</p>
          </div>
        </div>
          ):(
            <img src={content} alt="image" className='mt-3 w-full h-full' />
          )
        }
      </div>
    </div>
  );
};

export default RemoveObject;