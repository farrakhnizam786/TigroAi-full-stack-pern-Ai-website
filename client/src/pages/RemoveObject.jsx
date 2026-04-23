import { useAuth } from '@clerk/clerk-react';
import { Scissors, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
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
    try {
      if (!input) return toast.error('No file selected.');
      if (object.trim().split(/\s+/).length > 1) return toast.error('Please enter only one object name');

      setLoading(true);
      setContent('');

      const formData = new FormData();
      formData.append('image', input);
      formData.append('object', object);

      const { data } = await axios.post('/api/ai/remove-object', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message || 'Failed to remove object');
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
          <h1 className='text-xl font-semibold'>AI Object Removal</h1>
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
          <label className='text-sm font-medium'>Object name to remove</label>
          <textarea
            className='w-full bg-slate-100 dark:bg-slate-700 rounded-lg p-2 outline-none text-sm'
            placeholder='e.g., watch or spoon — only one word'
            value={object}
            onChange={(e) => setObject(e.target.value)}
            rows={4}
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#f6ab41] to-[#04ff50] px-4 py-2 rounded-lg transition-colors'
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent border-white animate-spin'></span>
          ) : (
            <Scissors className='w-5 h-5 inline mr-2' />
          )}
          Remove Object
        </button>
      </form>

      <div className='w-full flex-1 min-w-lg bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-lg min-h-96 overflow-y-auto'>
        <div className='flex items-center text-sm text-gray-500 gap-3 mb-3'>
          <Scissors className='text-[#4a7aff] w-4 h-5' />
          <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-200'>Object Removed</h1>
        </div>

        {!content ? (
          <div className='flex-1 flex justify-center items-center min-h-64'>
            <div className='text-gray-400 gap-5 flex flex-col items-center text-center px-6'>
              <Scissors className='w-9 h-9' />
              <p className='text-sm'>Upload an image and click "Remove Object"</p>
            </div>
          </div>
        ) : (
          <img src={content} alt="result" className='mt-3 w-full h-full rounded-lg' />
        )}
      </div>
    </div>
  );
};

export default RemoveObject;