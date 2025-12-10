import { AppConfig } from './types';

// Helper to safely parse float env vars
const parseRatio = (val: string | undefined, fallback: number): number => {
  if (!val) return fallback;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
};

// Default configuration with fallbacks if env vars are missing
export const CONFIG: AppConfig = {
  meiliHost: process.env.VITE_MEILISEARCH_HOST || 'http://localhost:7700',
  meiliKey: process.env.VITE_MEILISEARCH_API_KEY || '',
  meiliIndex: process.env.VITE_MEILISEARCH_INDEX || 'movies', 
  appTitle: process.env.VITE_APP_TITLE || 'Hybrid Search',
  appLogo: process.env.VITE_APP_LOGO,
  
  // Hybrid Search Configuration
  // 0.0 = Keyword Search, 1.0 = Vector Search, 0.5 = Balanced
  semanticRatio: parseRatio(process.env.VITE_MEILISEARCH_SEMANTIC_RATIO, 0.5),
  embedder: process.env.VITE_MEILISEARCH_EMBEDDER || 'default',
};

// AI Configuration
export const AI_MODEL_NAME = 'gemini-2.5-flash';
export const MAX_CONTEXT_HITS = 5; // How many search results to feed the AI
