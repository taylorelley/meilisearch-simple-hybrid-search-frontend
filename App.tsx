import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CONFIG } from './constants';
import { searchMeili } from './services/meilisearchService';
import { SearchState } from './types';
import { SearchIcon } from './components/Icons';
import { ThemeToggle } from './components/ThemeToggle';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  // -- Search State --
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
    searchTime: 0,
  });

  // Debounce ref
  const searchTimeout = useRef<any>(null);

  // -- Handlers --

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Immediately set hasSearched to trigger the layout animation
    setSearchState(prev => ({ ...prev, isLoading: true, error: null, hasSearched: true, query: searchQuery }));

    try {
      // Fetch Search Results
      const response = await searchMeili(searchQuery);

      setSearchState(prev => ({
        ...prev,
        results: response.hits,
        isLoading: false,
        searchTime: response.processingTimeMs,
      }));

    } catch (err: any) {
      setSearchState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "An error occurred while searching.",
      }));
    }
  }, []);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  // Helper for layout state
  const hasSearched = searchState.hasSearched;

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200 bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      
      {/* --- Dynamic Header Layer --- */}
      {/* Background Panel - Fades in when searching */}
      <div 
        className={`fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 transition-opacity duration-500 ${hasSearched ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />

      {/* Interactive Layer - Handles the movement of Logo and Search Bar */}
      <div className="fixed inset-0 z-50 pointer-events-none">
          
          {/* Theme Toggle - Fixed Position */}
          <div className="absolute top-4 right-4 sm:right-8 pointer-events-auto">
             <ThemeToggle />
          </div>

          {/* Logo Container */}
          <div 
            className={`absolute transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) pointer-events-auto flex items-center gap-3
                ${hasSearched 
                    ? 'top-4 left-4 sm:left-8 scale-100 translate-x-0' 
                    : 'top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 flex-col sm:flex-row'
                }
            `}
          >
             {CONFIG.appLogo ? (
                 <img src={CONFIG.appLogo} alt="Logo" className="h-8 w-8 object-contain" />
             ) : (
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                    {CONFIG.appTitle.charAt(0)}
                </div>
             )}
             <span className={`font-semibold tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap transition-all duration-500 ${hasSearched ? 'text-lg opacity-100 hidden sm:block' : 'text-3xl opacity-100'}`}>
               {CONFIG.appTitle}
             </span>
          </div>

          {/* Search Bar Container */}
          <div 
            className={`absolute transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) pointer-events-auto w-full flex flex-col items-center px-4
                 ${hasSearched
                   ? 'top-3 left-1/2 -translate-x-1/2 max-w-xl' // Top Bar Position
                   : 'top-[45%] left-1/2 -translate-x-1/2 max-w-2xl' // Hero Center Position
                 }
            `}
          >
            <form onSubmit={onFormSubmit} className="w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className={`text-slate-400 group-focus-within:text-indigo-500 transition-all ${hasSearched ? 'h-5 w-5' : 'h-6 w-6'}`} />
                </div>
                <input
                    type="text"
                    className={`block w-full rounded-full bg-white dark:bg-slate-800 border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 outline-none transition-all placeholder:text-slate-400 dark:text-white
                        ${hasSearched 
                            ? 'pl-10 pr-4 py-2.5 text-sm sm:text-base shadow-sm border border-slate-200 dark:border-slate-700' 
                            : 'pl-12 pr-6 py-4 text-lg shadow-xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-700'
                        }
                    `}
                    placeholder={hasSearched ? "Ask anything..." : "What are you looking for?"}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>
          </div>

      </div>

      {/* --- Main Content Area --- */}
      <main className={`flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${hasSearched ? 'pt-24 opacity-100' : 'pt-0 opacity-0'}`}>
        
        {/* Search Error */}
        {searchState.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6 text-center">
                {searchState.error}
            </div>
        )}

        {/* Results Area */}
        {searchState.hasSearched && (
            <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                
                {/* Meta info */}
                {!searchState.isLoading && (
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Found {searchState.results.length} results in {searchState.searchTime}ms
                        </p>
                    </div>
                )}

                {/* Main Results List */}
                <div className="space-y-4 pb-12">
                    {searchState.isLoading ? (
                        // Skeleton Loading
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse flex flex-col gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                            </div>
                        ))
                    ) : searchState.results.length > 0 ? (
                        searchState.results.map((hit, index) => (
                            <ResultCard key={hit.id || index} hit={hit} index={index} />
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <SearchIcon className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No results found</h3>
                            <p className="text-slate-500 mt-1">We couldn't find anything matching "{searchState.query}"</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </main>

       {/* Footer */}
       {hasSearched && (
        <footer className="py-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-800 mt-auto">
            <p>Powered by Meilisearch Hybrid Search</p>
        </footer>
       )}
    </div>
  );
};

export default App;