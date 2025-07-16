import { Hash, Sparkles, Edit } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';

const BlogTitles = () => {
  const blogCategories = [
    'General', 'Technology', 'Health', 'Lifestyle', 'Education',
    'Travel', 'Finance', 'Food', 'Entertainment', 'Sports'
  ];

  const [selectedCategory, setSelectedCategory] = useState('General');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setContent('');
      const prompt = `Generate a blog title for the keyword "${input}" in the category "${selectedCategory}"`;
      const { data } = await axios.post(
        'http://localhost:3000/api/ai/generate-blog-title',
        { prompt },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message || 'Failed to generate title');
      }
    } catch (error) {
      toast.error(error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-6 text-slate-900 dark:text-slate-200'>
      {/* LEFT FORM */}
      <form
        onSubmit={onSubmitHandler}
        className='w-full max-w-lg p-4 flex flex-col gap-6 rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-lg'
      >
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 h-6 text-[#8E37eb]' />
          <h1 className='text-xl font-semibold'>AI Blog Title Generator</h1>
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Keyword</label>
          <input
            type='text'
            className='border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none text-sm'
            placeholder='The Future Of AI Is...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Category</label>
          <div className='flex gap-2 flex-wrap'>
            {blogCategories.map((item) => (
              <span
                key={item}
                onClick={() => setSelectedCategory(item)}
                className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition-colors ${
                  selectedCategory === item
                    ? 'bg-[#5044E5] text-white border-[#5044E5]'
                    : 'text-gray-500 border-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          type='submit'
          className='bg-[#5044E5] text-white px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors flex items-center justify-center'
        >
          {loading ? (
            <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          ) : (
            <>
              <Hash className='w-5 h-5 inline mr-2' />
              Generate Title
            </>
          )}
        </button>
      </form>

      {/* RIGHT RESULT BOX */}
      <div className='w-full flex-1 min-w-lg bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-lg min-h-96 max-h-[600px]'>
        <div className='text-sm text-gray-500 gap-3 mb-4'>
          <h1 className='text-xl font-semibold flex items-center gap-2'>
            <Edit className='w-5 h-5' />
            Your Generated Blog Title
          </h1>
        </div>

        {loading ? (
          <div className='flex justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500'></div>
          </div>
        ) : !content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-gray-400 gap-5 flex flex-col items-center'>
              <Hash className='w-9 h-9' />
              <p className='text-sm'>
                Once your creative mind has an idea, just click "Generate Title".
              </p>
            </div>
          </div>
        ) : (
          <div className='overflow-y-auto max-h-[440px] pr-2'>
            <div className='prose dark:prose-invert max-w-none reset-tw'>
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
