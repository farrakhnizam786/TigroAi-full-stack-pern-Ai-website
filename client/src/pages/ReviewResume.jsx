import { useAuth } from '@clerk/clerk-react';
import { FileText, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Markdown from 'react-markdown'; // ✅ You forgot to import this!

const ReviewResume = () => {
  const [input, setInput] = useState('');
  const [Publish, setPublish] = useState(false); // 👀 Unused, but left untouched as per request
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
        'http://localhost:3000/api/ai/review-resume',
        formData,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message || 'Failed to review resume');
      }
    } catch (error) {
      toast.error(error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return !loading ? (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-6 text-slate-900 dark:text-slate-200'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 flex flex-col gap-6 rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-lg'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 h-6 text-[#00da83]' />
          <h1 className='text-xl font-semibold'>Ai Resume Review</h1>
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

        <button disabled={loading} type="submit" className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#9c19ab] to-[#04ff50] px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors'>
          {
            loading ?
              <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent border-white animate-spin'></span> :
              <>
                <FileText className='w-5 h-5 inline' />
                Review Resume
              </>
          }
        </button>
      </form>

      <div className='w-full flex-1 min-w-lg bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-lg min-h-96 max-h-[600px] overflow-y-auto'>
        <div className='text-sm text-gray-500 gap-3'>
          <FileText className='text-[#00ad83] w-4 h-5' />
          <h1 className='text-xl font-semibold'>Result</h1>
        </div>
        {
          !content ? (
            <div className='flex-1 flex justify-center items-center'>
              <div className='text-gray-400 gap-5 flex flex-col items-center'>
                <FileText className='w-9 h-9' />
                <p className='text-sm'>Once your file is uploaded, just click "Review Resume".</p>
              </div>
            </div>
          ) : (
            <div className='mt-3 h-full overflow-y-scroll text-sm'>
              <div className='reset-tw'>
                <Markdown>{content}</Markdown>
              </div>
            </div>
          )
        }
      </div>
    </div>
  ) : (
    <div className='flex justify-around items-center h-full'>
      <span className='w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-bounce'></span>
    </div>
  );
};

export default ReviewResume;
