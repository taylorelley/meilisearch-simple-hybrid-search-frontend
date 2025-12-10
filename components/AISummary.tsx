import React from 'react';
import { SparklesIcon } from './Icons';
import { AISummaryState } from '../types';

interface AISummaryProps {
  state: AISummaryState;
  onRetry?: () => void;
}

const AISummary: React.FC<AISummaryProps> = ({ state, onRetry }) => {
  if (!state.isLoading && !state.content && !state.error) {
    return null;
  }

  // Basic markdown parser
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      const bolded = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-slate-900 dark:text-white font-semibold">{part.slice(2, -2)}</strong>;
          }
          return part;
      });

      // Bullets
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={i} className="flex gap-3 mb-2 ml-1">
            <span className="text-indigo-500 mt-1.5 text-xs">●</span>
            <span className="flex-1 leading-relaxed">{bolded.slice(1).length > 0 ? bolded : line.replace(/^[-*]\s+/, '')}</span>
          </div>
        );
      }
      
      // Numbered
      if (/^\d+\.\s/.test(line.trim())) {
         return (
            <div key={i} className="flex gap-2 mb-2 ml-1">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium text-sm mt-0.5">{line.match(/^\d+\./)?.[0]}</span>
                <span className="leading-relaxed flex-1">{line.replace(/^\d+\.\s/, '')}</span>
            </div>
         );
      }

      if (line.trim() === '') return <div key={i} className="h-3" />;

      return <p key={i} className="mb-2 leading-relaxed text-slate-700 dark:text-slate-300">{bolded}</p>;
    });
  };

  return (
    <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-slate-800 dark:to-slate-800 border border-indigo-100/50 dark:border-indigo-900/30 shadow-sm ring-1 ring-indigo-500/10 transition-all duration-300">
      
      {/* Loading Bar Animation */}
      {state.isLoading && (
         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-[shimmer_2s_infinite]"></div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100/50 dark:border-white/5 bg-white/40 dark:bg-black/10 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 ${state.isStreaming ? 'animate-pulse' : ''}`}>
                <SparklesIcon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            AI Overview
            </h2>
        </div>
        {state.isStreaming && (
            <span className="text-[10px] font-medium tracking-wider uppercase text-indigo-400 animate-pulse">
                Generating...
            </span>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 text-[15px] text-slate-700 dark:text-slate-300 leading-7">
        {state.isLoading && !state.content && (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-indigo-200/20 dark:bg-slate-700/60 rounded w-11/12"></div>
            <div className="h-4 bg-indigo-200/20 dark:bg-slate-700/60 rounded w-full"></div>
            <div className="h-4 bg-indigo-200/20 dark:bg-slate-700/60 rounded w-4/5"></div>
          </div>
        )}

        {state.error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm">
                <p className="font-medium">Summary unavailable</p>
                <p className="opacity-80 mt-1">{state.error}</p>
                {onRetry && (
                    <button onClick={onRetry} className="mt-2 text-xs font-semibold underline decoration-dotted hover:decoration-solid">
                        Try Again
                    </button>
                )}
            </div>
        )}

        {state.content && (
            <div className="markdown-body">
                {renderMarkdown(state.content)}
            </div>
        )}
      </div>
      
      {/* Footer */}
      {state.content && (
          <div className="px-6 py-3 bg-white/50 dark:bg-black/20 border-t border-indigo-50 dark:border-white/5 flex items-center justify-between backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Generative content may be inaccurate.
              </span>
          </div>
      )}
    </div>
  );
};

export default AISummary;
