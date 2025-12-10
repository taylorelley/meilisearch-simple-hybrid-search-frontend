/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEILISEARCH_HOST?: string
  readonly VITE_MEILISEARCH_API_KEY?: string
  readonly VITE_MEILISEARCH_INDEX?: string
  readonly VITE_MEILISEARCH_SEMANTIC_RATIO?: string
  readonly VITE_MEILISEARCH_EMBEDDER?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_LOGO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Extend Window interface for runtime config
interface Window {
  ENV_CONFIG?: {
    VITE_MEILISEARCH_HOST?: string
    VITE_MEILISEARCH_API_KEY?: string
    VITE_MEILISEARCH_INDEX?: string
    VITE_MEILISEARCH_SEMANTIC_RATIO?: string
    VITE_MEILISEARCH_EMBEDDER?: string
    VITE_APP_TITLE?: string
    VITE_APP_LOGO?: string
  }
}
