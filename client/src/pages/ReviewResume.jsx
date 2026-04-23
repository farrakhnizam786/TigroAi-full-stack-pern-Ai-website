import { useAuth } from '@clerk/clerk-react';
import { FileText, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!input) {
        toast.error('No file selected.');
        return;
      }

      setLoading(true);
      setContent('');

      const formData = new FormData();
      formData.append('resume', input);

      const { data } = await axios.post(
        '/api/ai/review-resume',
        formData,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success('Resume reviewed!');
      } else {
        toast.error(data.message || 'Failed to review resume');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-6 text-slate-900 dark:text-slate-200'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 flex flex-col gap-6 rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-lg'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 h-6 text-[#00da83]' />
          <h1 className='text-xl font-semibold'>AI Resume Review</h1>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Upload Resume</label>
          <input
            type="file"
            className='border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none text-sm text-gray-600'
            accept='application/pdf'
            onChange={(e) => setInput(e.target.files[0])}
            required
          />
        </div>

        <p className='text-xs text-gray-500 font-light mt-1'>Supports PDF resume only.</p>

        <button
          disabled={loading}
          type="submit"
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#9c19ab] to-[#04ff50] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity'
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent border-white animate-spin'></span>
          ) : (
            <>
              <FileText className='w-5 h-5 inline' />
              Review Resume
            </>
          )}
        </button>
      </form>

      <div className='w-full flex-1 min-w-lg bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-lg min-h-96 max-h-[600px] overflow-y-auto'>
        <div className='flex items-center gap-2 mb-3'>
          <FileText className='text-[#00ad83] w-4 h-5' />
          <h1 className='text-xl font-semibold'>Result</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : !content ? (
          <div className='flex-1 flex justify-center items-center h-48'>
            <div className='text-gray-400 gap-5 flex flex-col items-center'>
              <FileText className='w-9 h-9' />
              <p className='text-sm'>Once your file is uploaded, just click "Review Resume".</p>
            </div>
          </div>
        ) : (
          <div className='mt-3 h-full overflow-y-auto text-sm'>
            <div className='reset-tw'>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;