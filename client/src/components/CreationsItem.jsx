import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp, ImageIcon, FileText, Globe, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const typeColors = {
  'article': 'bg-blue-50 text-blue-700 border-blue-200',
  'blog-title': 'bg-purple-50 text-purple-700 border-purple-200',
  'image': 'bg-green-50 text-green-700 border-green-200',
  'resume_review': 'bg-amber-50 text-amber-700 border-amber-200',
};

const CreationsItem = ({ item, onRefresh }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [isPublished, setIsPublished] = React.useState(item.publish || false);
  const { getToken } = useAuth();
  const colorClass = typeColors[item.type] || 'bg-gray-50 text-gray-600 border-gray-200';
  const isImage = item.type === 'image';

  const handlePublishToggle = async (e) => {
    e.stopPropagation();
    try {
      setPublishing(true);
      const { data } = await axios.post(
        '/api/user/toggle-publish-creation',
        { id: item.id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        setIsPublished(data.published);
        toast.success(data.message);
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Failed to update publish status');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className='bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden'
    >
      {/* Header row */}
      <div className='flex items-center justify-between gap-3 px-4 py-3'>
        <div className='flex items-center gap-3 min-w-0'>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isImage ? 'bg-green-100' : 'bg-blue-100'}`}>
            {isImage
              ? <ImageIcon className='w-4 h-4 text-green-600' />
              : <FileText className='w-4 h-4 text-blue-600' />
            }
          </div>
          <div className='min-w-0'>
            <h2 className='text-sm font-medium text-gray-800 truncate'>{item.prompt}</h2>
            <p className='text-xs text-gray-400 mt-0.5'>
              {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          {/* Publish toggle button */}
          <button
            onClick={handlePublishToggle}
            disabled={publishing}
            title={isPublished ? 'Remove from Community' : 'Publish to Community'}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
              isPublished
                ? 'bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100'
                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-600'
            } ${publishing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {publishing ? (
              <span className='w-3 h-3 rounded-full border border-t-transparent animate-spin' />
            ) : isPublished ? (
              <><Globe className='w-3 h-3' /><span className='hidden sm:inline'>Published</span></>
            ) : (
              <><EyeOff className='w-3 h-3' /><span className='hidden sm:inline'>Publish</span></>
            )}
          </button>

          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${colorClass}`}>
            {item.type}
          </span>
          {expanded
            ? <ChevronUp className='w-4 h-4 text-gray-400' />
            : <ChevronDown className='w-4 h-4 text-gray-400' />
          }
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className='border-t border-gray-100 px-4 py-3 bg-gray-50'>
          {isImage ? (
            <img
              src={item.content}
              alt={item.prompt}
              className='rounded-lg w-full max-w-md object-contain max-h-72'
            />
          ) : (
            <div className='text-sm text-slate-700 max-h-64 overflow-y-auto pr-1 reset-tw'>
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreationsItem;
