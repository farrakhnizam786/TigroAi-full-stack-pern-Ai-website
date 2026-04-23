import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { Heart, Sparkles, ImageIcon, Users, FileText, Hash, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const typeLabel = {
  image: { icon: <ImageIcon className='w-3 h-3' />, label: 'Image', color: 'bg-green-100 text-green-700' },
  article: { icon: <FileText className='w-3 h-3' />, label: 'Article', color: 'bg-blue-100 text-blue-700' },
  'blog-title': { icon: <Hash className='w-3 h-3' />, label: 'Blog Title', color: 'bg-purple-100 text-purple-700' },
};

// Floating article reader modal
const ArticleModal = ({ creation, onClose }) => {
  if (!creation) return null;
  const meta = typeLabel[creation.type] || typeLabel['article'];
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className='flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-700'>
          <div className='pr-8'>
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${meta.color}`}>
              {meta.icon} {meta.label}
            </div>
            <p className='text-xs italic text-gray-400'>"{creation.prompt}"</p>
          </div>
          <button
            onClick={onClose}
            className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
          >
            <X className='w-4 h-4 text-gray-500' />
          </button>
        </div>

        {/* Modal body — scrollable */}
        <div className='overflow-y-auto flex-1 p-5'>
          <p className='text-sm text-gray-700 dark:text-slate-200 whitespace-pre-line leading-relaxed'>
            {creation.content}
          </p>
        </div>

        {/* Modal footer */}
        <div className='border-t border-slate-100 dark:border-slate-700 px-5 py-3 flex items-center justify-between'>
          <span className='text-xs text-gray-400'>
            {new Date(creation.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <button
            onClick={onClose}
            className='text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Community = () => {
  const [creations, setCreations] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchCreations = async () => {
    try {
      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { authorization: `Bearer ${await getToken()}` }
      });
      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post('/api/user/toggle-like-creations', { id }, {
        headers: { authorization: `Bearer ${await getToken()}` }
      });
      if (data.success) {
        toast.success(data.message);
        await fetchCreations();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCreations();
  }, []);

  const images = creations.filter(c => c.type === 'image');
  const textCards = creations.filter(c => c.type !== 'image');

  return (
    <>
      {/* Floating article reader modal */}
      {selectedArticle && (
        <ArticleModal creation={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

      <div className='h-full flex flex-col p-6 gap-5 overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-md'>
            <Users className='w-5 h-5 text-white' />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-800 dark:text-slate-100'>Community Gallery</h1>
            <p className='text-xs text-gray-500'>Explore AI creations shared by the community</p>
          </div>
          <span className='ml-auto text-xs bg-violet-100 text-violet-700 font-semibold px-3 py-1 rounded-full'>
            {creations.length} creations
          </span>
        </div>

        {loading ? (
          <div className='flex flex-col items-center justify-center h-64 gap-3'>
            <div className='w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin' />
            <p className='text-sm text-gray-500'>Loading community creations…</p>
          </div>
        ) : creations.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-64 gap-3 text-gray-400'>
            <Sparkles className='w-14 h-14' />
            <p className='text-sm font-medium'>No creations yet. Generate an article or image and publish it to get started!</p>
          </div>
        ) : (
          <div className='flex flex-col gap-8'>

            {/* ── Text Creations (articles + blog titles) ── */}
            {textCards.length > 0 && (
              <section>
                <h2 className='text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3'>
                  Articles & Blog Titles
                </h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {textCards.map((creation, index) => {
                    const meta = typeLabel[creation.type] || typeLabel['article'];
                    const liked = creation.likes?.includes(user?.id);
                    return (
                      <div
                        key={index}
                        className='relative flex flex-col justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group'
                        onClick={() => setSelectedArticle(creation)}
                      >
                        {/* Type badge */}
                        <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit mb-2 ${meta.color}`}>
                          {meta.icon} {meta.label}
                        </div>

                        {/* Prompt */}
                        <p className='text-xs text-gray-400 mb-1 line-clamp-1 italic'>"{creation.prompt}"</p>

                        {/* Content preview (truncated) */}
                        <p className='text-sm text-gray-700 dark:text-slate-200 line-clamp-4 flex-1 mb-3'>
                          {creation.content}
                        </p>

                        {/* Read more hint */}
                        <p className='text-xs text-violet-500 group-hover:underline mb-2'>Click to read full content →</p>

                        {/* Footer */}
                        <div
                          className='flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-700'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className='text-xs text-gray-400'>
                            {new Date(creation.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => imageLikeToggle(creation.id)}
                            className='flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20'
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 text-red-500' : ''}`}
                            />
                            <span>{creation.likes?.length ?? 0}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Image Gallery ── */}
            {images.length > 0 && (
              <section>
                <h2 className='text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3'>
                  AI Images
                </h2>
                <div className='columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3'>
                  {images.map((creation, index) => (
                    <div
                      key={index}
                      className='relative group break-inside-avoid rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300'
                    >
                      <img
                        src={creation.content}
                        alt={creation.prompt}
                        className='w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105'
                      />

                      {/* Overlay */}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3'>
                        <p className='text-white text-xs line-clamp-2 mb-2'>{creation.prompt}</p>
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-white/70'>
                            {new Date(creation.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); imageLikeToggle(creation.id); }}
                            className='flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full hover:bg-white/30 transition-colors'
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${
                                creation.likes?.includes(user?.id)
                                  ? 'fill-red-500 text-red-400'
                                  : 'text-white'
                              }`}
                            />
                            <span className='text-white text-xs font-medium'>{creation.likes?.length ?? 0}</span>
                          </button>
                        </div>
                      </div>

                      {/* Like badge on mobile */}
                      <div className='absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full sm:hidden'>
                        <Heart className={`w-3 h-3 ${creation.likes?.includes(user?.id) ? 'fill-red-500 text-red-400' : 'text-white'}`} />
                        <span className='text-white text-xs'>{creation.likes?.length ?? 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </>
  );
};

export default Community;