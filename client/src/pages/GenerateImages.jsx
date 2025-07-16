import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Image, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyle = ['Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', '3D style', 'Portrait style'];

  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [input, setInput] = useState('');
  const [Publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setContent('');
      const prompt = `Generate an image of ${input} in style ${selectedStyle}`;

      const { data } = await axios.post(
        'http://localhost:3000/api/ai/generate-image',
        { prompt, Publish },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message || 'Failed to generate image');
      }
    } catch (error) {
      toast.error(error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-6 text-slate-900 dark:text-slate-200'>
      {/* Form */}
      <form
        onSubmit={onSubmitHandler}
        className='w-full max-w-lg p-4 flex flex-col gap-6 rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-lg'
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 h-6 text-[#00ad25]' />
          <h1 className='text-xl font-semibold'>AI Image Generator</h1>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Describe Your Image</label>
          <textarea
            className='border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none text-sm'
            placeholder='The Imagination Comes true. Describe what you want...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Style</label>
          <div className='flex gap-2 flex-wrap'>
            {imageStyle.map((item) => (
              <span
                key={item}
                onClick={() => setSelectedStyle(item)}
                className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition-colors ${
                  selectedStyle === item
                    ? 'bg-green-50 text-purple-700'
                    : 'text-gray-700 dark:text-gray-200 border-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className='my-6 flex items-center gap-2'>
          <label className='relative cursor-pointer'>
            <input
              type='checkbox'
              onChange={(e) => setPublish(e.target.checked)}
              checked={Publish}
              className='sr-only peer'
            />
            <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition'></div>
            <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
          </label>
          <p>Make this Image public</p>
        </div>

        <button
          disabled={loading}
          type='submit'
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00ad25] to-[#04ff50] px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer transition-colors'
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin border-white'></span>
          ) : (
            <>
              <Image className='w-5 h-5 inline mr-2' />
              Generate Image
            </>
          )}
        </button>
      </form>

      {/* Result Panel */}
      <div className='w-full flex-1 min-w-lg bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-lg min-h-96 max-h-[600px] overflow-y-auto'>
        <div className='text-sm text-gray-500 gap-3 mb-3'>
          <h1 className='text-xl font-semibold flex items-center gap-2'>
            <Image className='w-5 h-5' />
            Your Generated Image
          </h1>
        </div>

        {loading ? (
          <div className='flex justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500'></div>
          </div>
        ) : !content ? (
          <div className='flex-1 flex justify-center items-center h-[300px]'>
            <div className='text-gray-400 gap-5 flex flex-col items-center'>
              <Image className='w-9 h-9' />
              <p className='text-sm text-center'>Once you're ready, click "Generate Image".</p>
            </div>
          </div>
        ) : (
          <div className='h-[360px] overflow-y-auto pr-2'>
            <img src={content} alt='Generated' className='w-full h-auto rounded-lg object-contain' />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImages; //api need to change .env
