export interface MeiliSearchHit {
  id: string | number;
  title?: string;
  content?: string;
  description?: string;
  url?: string;
  _rankingScore?: number;
  _formatted?: {
    title?: string;
    content?: string;
    description?: string;
    overview?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface MeiliSearchResponse {
  hits: MeiliSearchHit[];
  estimatedTotalHits: number;
  processingTimeMs: number;
  query: string;
}

export interface SearchState {
  query: string;
  results: MeiliSearchHit[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  searchTime: number;
}

export interface AppConfig {
  meiliHost: string;
  meiliKey: string;
  meiliIndex: string;
  appTitle: string;
  appLogo?: string;
  // Hybrid Search Config
  semanticRatio: number;
  embedder: string;
}