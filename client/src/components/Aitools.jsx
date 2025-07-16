import React from 'react';
import { AiToolsData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const Aitools = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div className="text-center py-12">Loading tools...</div>;

  return (
    <section className='px-4 sm:px-20 xl:px-32 my-24'>
      <div className='text-center mb-12'>
        <h2 className='text-slate-700 text-[42px] font-semibold'>Enhance Your Work With AI Tools</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>
          Everything you need to create, work, improve and optimize your content with cutting edge AI technology.
        </p>
      </div>
      
      <div className='flex flex-wrap justify-center gap-6 mt-10'>
        {AiToolsData.map((tool) => {
          // Skip rendering if tool data is incomplete
          if (!tool || !tool.path || !tool.Icon) {
            console.warn('Incomplete tool data:', tool);
            return null;
          }

          const IconComponent = tool.Icon;
          
          return (
            <article
              key={tool.id || tool.path}
              className='w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] p-6 rounded-lg bg-white shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer'
              onClick={() => user && navigate(`/ai/${tool.path}`)}
              role="button"
              tabIndex={0}
              aria-label={`Open ${tool.title} tool`}
              onKeyDown={(e) => e.key === 'Enter' && user && navigate(`/ai/${tool.path}`)}
            >
              <div 
                className='w-12 h-12 p-3 text-white rounded-xl flex items-center justify-center mb-4'
                style={{ 
                  background: tool.bg?.from && tool.bg?.to 
                    ? `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})` 
                    : '#6b7280' // Fallback color
                }}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <h3 className='text-lg font-semibold mb-2'>{tool.title}</h3>
              <p className='text-gray-500 text-sm'>{tool.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Aitools;