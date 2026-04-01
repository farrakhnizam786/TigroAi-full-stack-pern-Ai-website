import React from 'react'
import ReactMarkdown from 'react-markdown';

const Creationsitem = ({item}) => {

  const [expanded, setExpanded] = React.useState(false);
  return (
    <div onClick={() => setExpanded(!expanded)} className='p-4 max-w5x1 text-sm bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer'>
        <div className='flex items-center justify-between gap-4'>
            <div className=''>
                <h2>{item.prompt}</h2>
                <p className='text-gray-500'>{item.type}-{new Date(item.created_at).toLocaleDateString()}</p>
            </div>
            <button className='bg-[#eff6ff] border border-[#d1d5db] text-[#1e40af] px-4 py-1 rounded-full'>{item.type}</button>
        </div>
        {
          expanded && (
            <div>
              {item.type === 'image' ? (
                <div>
                  <img src={item.image} alt='image' className='mt-4 rounded-lg w-full max-w-md' />
                </div>
              ): (
                <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-700'>
                  <div className='reset-tw'>
                    <ReactMarkdown>{item.content}</ReactMarkdown>  
                  </div>

                </div>
              )}
            </div>
          )
        }
    
    </div>
  )
}

export default Creationsitem
