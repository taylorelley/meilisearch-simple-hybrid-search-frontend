import { AppConfig } from './types';

// Helper to safely parse float env vars
const parseRatio = (val: string | undefined, fallback: number): number => {
  if (!val) return fallback;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
};

// Get environment variable from runtime config or build-time env
const getEnv = (key: string): string | undefined => {
  // Check runtime config first (Docker/production)
  if (typeof window !== 'undefined' && (window as any).ENV_CONFIG) {
    return (window as any).ENV_CONFIG[key];
  }
  // Fall back to build-time env (development)
  return import.meta.env[key];
};

// Default configuration with fallbacks if env vars are missing
export const CONFIG: AppConfig = {
  meiliHost: getEnv('VITE_MEILISEARCH_HOST') || 'http://localhost:7700',
  meiliKey: getEnv('VITE_MEILISEARCH_API_KEY') || '',
  meiliIndex: getEnv('VITE_MEILISEARCH_INDEX') || 'movies',
  appTitle: getEnv('VITE_APP_TITLE') || 'Hybrid Search',
  appLogo: getEnv('VITE_APP_LOGO'),

  // Hybrid Search Configuration
  // 0.0 = Keyword Search, 1.0 = Vector Search, 0.5 = Balanced
  semanticRatio: parseRatio(getEnv('VITE_MEILISEARCH_SEMANTIC_RATIO'), 0.5),
  embedder: getEnv('VITE_MEILISEARCH_EMBEDDER') || 'default',
};
