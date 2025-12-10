import { CONFIG } from '../constants';
import { MeiliSearchResponse } from '../types';

/**
 * Executes a search query against the configured Meilisearch instance.
 * Uses standard fetch to avoid heavy dependencies in this demo environment.
 */
export const searchMeili = async (query: string): Promise<MeiliSearchResponse> => {
  if (!query.trim()) {
    return { hits: [], estimatedTotalHits: 0, processingTimeMs: 0, query: '' };
  }

  const url = `${CONFIG.meiliHost}/indexes/${CONFIG.meiliIndex}/search`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.meiliKey}`,
      },
      body: JSON.stringify({
        q: query,
        limit: 20,
        attributesToHighlight: ['title', 'content', 'description'],
        highlightPreTag: '<span class="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 rounded px-0.5 box-decoration-clone">',
        highlightPostTag: '</span>',
        showRankingScore: true,
        // Meilisearch Hybrid Search Configuration
        hybrid: {
          semanticRatio: CONFIG.semanticRatio,
          embedder: CONFIG.embedder
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Handle missing vector store gracefully if possible, but usually we throw
      throw new Error(`Meilisearch Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Normalize data structure if needed
    return {
      hits: data.hits || [],
      estimatedTotalHits: data.estimatedTotalHits || 0,
      processingTimeMs: data.processingTimeMs || 0,
      query,
    };
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
};
