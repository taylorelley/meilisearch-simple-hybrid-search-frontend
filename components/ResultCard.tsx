import React from 'react';
import { MeiliSearchHit } from '../types';
import { ExternalLinkIcon } from './Icons';

interface ResultCardProps {
  hit: MeiliSearchHit;
  index: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ hit, index }) => {
  // Fallback for title/content if the index schema varies
  const title = hit._formatted?.title || hit.title || hit.name || "Untitled Document";
  const content = hit._formatted?.overview || hit._formatted?.description || hit._formatted?.content || hit.description || hit.content || JSON.stringify(hit);
  
  // URL processing
  const rawUrl = hit.url || hit.link || '#';
  let hostname = 'Source';
  let path = '';
  
  if (rawUrl !== '#') {
    try {
      const urlObj = new URL(rawUrl);
      hostname = urlObj.hostname;
      path = urlObj.pathname !== '/' ? urlObj.pathname : '';
      if (path.length > 20) path = path.substring(0, 20) + '...';
    } catch (e) {
      // ignore invalid urls
    }
  }

  // Helper to safely render HTML highlights from Meilisearch
  const createMarkup = (html: string) => {
    return { __html: html };
  };

  return (
    <div className="group relative flex flex-col gap-1 p-4 -mx-4 sm:mx-0 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-200">
      <div className="flex items-center gap-2 text-xs mb-1">
        {/* URL Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium border border-slate-200 dark:border-slate-700 overflow-hidden">
                {rawUrl !== '#' ? (
                    <img 
                        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} 
                        alt="" 
                        className="w-4 h-4 object-cover opacity-80" 
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('fallback-icon');
                        }} 
                    />
                ) : (
                    <span>{index + 1}</span>
                )}
            </div>
            <div className="flex flex-col leading-none">
                <span className="font-medium text-slate-900 dark:text-slate-100">{hostname}</span>
                {path && <span className="text-slate-500 text-[10px]">{path}</span>}
            </div>
        </div>
        
        {/* Relevance Score Badge */}
        {hit._rankingScore && (
             <span className="ml-auto text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                Score: {hit._rankingScore.toFixed(2)}
             </span>
        )}
      </div>
      
      <a href={rawUrl} target="_blank" rel="noopener noreferrer" className="block group-hover:underline decoration-indigo-500 underline-offset-2 decoration-2">
        <h3 
            className="text-lg sm:text-xl text-indigo-700 dark:text-indigo-400 font-medium tracking-tight mb-1"
            dangerouslySetInnerHTML={createMarkup(String(title))}
        />
      </a>

      <div 
        className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed"
        dangerouslySetInnerHTML={createMarkup(String(content))}
      />

      {rawUrl !== '#' && (
          <div className="absolute top-4 right-4 sm:right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLinkIcon className="w-4 h-4 text-slate-400" />
          </div>
      )}
    </div>
  );
};

export default ResultCard;
