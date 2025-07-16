import React, { useState } from 'react';
import { Edit, Sparkles } from 'lucide-react';
import axios, { Axios } from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown'; // ✅ Import for Markdown rendering

const WriteArticle = () => {
  const articleLengths = [
    { length: 800, text: 'Short (500-800 words)' }, 
    { length: 1200, text: 'Medium (800-1200 words)' },
    { length: 1500, text: 'Long (1200+ words)' }
  ];

  const [selectedLength, setSelectedLength] = useState(articleLengths[0]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setContent(''); // Clear previous content
      const prompt = `write an article about ${input} in ${selectedLength.text}`;
      
      const { data } = await axios.post(
        'http://localhost:3000/api/ai/generate-article',
        { prompt, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data?.success && data?.content) {
        setContent(data.content);
      } else {
        toast.error(data?.message || 'Failed to generate article');
      }
    } catch (error) {
      console.error('API Error:', error);
      toast.error(error.response?.data?.message || error.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-6 text-slate-900 dark:text-slate-200'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 flex flex-col gap-6 rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-lg'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 h-6 text-[#5044E5]' />
          <h1 className='text-xl font-semibold'>Article Configuration</h1>
        </div>
        
        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Article Topic</label>
          <input
            type="text" 
            className='border border-slate-300 dark:border-slate-600 rounded-lg p-2 outline-none text-sm' 
            placeholder='The Future Of AI Is...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label className='text-sm font-medium'>Article Length</label>
          <div className='flex gap-2 flex-wrap'>
            {articleLengths.map((item, index) => (
              <span 
                onClick={() => setSelectedLength(item)}
                className={`text-xs px-4 py-2 border rounded-full cursor-pointer transition-colors ${
                  selectedLength?.text === item.text 
                    ? 'bg-[#5044E5] text-white border-[#5044E5]' 
                    : 'text-gray-500 border-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                key={index}
              >
                {item.text}
              </span>
            ))}
          </div>
        </div>

        <button 
          disabled={loading} 
          type="submit" 
          className='bg-[#5044E5] text-white px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-2'
        >
          {loading ? (
            <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <>
              <Edit className='w-5 h-5' />
              Generate Article
            </>
          )}
        </button>
      </form>

      <div className='w-full flex-1 min-w-lg bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-lg min-h-96 max-h-[600px] overflow-y-auto'>
        <div className='text-sm text-gray-500 gap-3'>
          <h1 className='text-xl font-semibold'>Generated Article</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : content ? (
          <div className='overflow-y-auto max-h-[440px] pr-2'>
            <div className='prose dark:prose-invert max-w-none reset-tw'>

            {/* ✅ Replaced dangerouslySetInnerHTML with ReactMarkdown */}
            <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-gray-400 gap-5 flex flex-col items-center'>
              <Edit className='w-9 h-9' />
              <p className='text-sm'>Enter your topic and click "Generate Article"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WriteArticle;
