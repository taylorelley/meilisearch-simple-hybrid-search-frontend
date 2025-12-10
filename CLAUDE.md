# CLAUDE.md - AI Assistant Guide

## Project Overview

**MeiliGemini Hybrid Search** is a modern, Google-like AI search interface that combines Meilisearch's hybrid search capabilities (keyword + vector/semantic search) with Google Gemini's generative AI to provide intelligent search summaries. Built with React, TypeScript, and Vite.

### Key Features
- Hybrid search using Meilisearch (configurable semantic vs keyword ratio)
- AI-powered search summaries via Google Gemini with streaming responses
- Dynamic UI with smooth transitions between search states
- Dark mode support with system preference detection
- Responsive design with TailwindCSS

---

## Tech Stack

- **Frontend Framework**: React 19.2.1 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: TailwindCSS (CDN) + Inter font
- **Search Engine**: Meilisearch (hybrid search with vector embeddings)
- **AI Service**: Google Gemini 2.5 Flash via `@google/genai` SDK
- **Type Safety**: TypeScript with strict configuration
- **Module System**: ES Modules (ESNext)

---

## Codebase Structure

```
/
├── components/           # React UI components
│   ├── AISummary.tsx    # AI overview card with streaming support
│   ├── ResultCard.tsx   # Individual search result display
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   └── Icons.tsx        # SVG icon components
├── services/            # External API integrations
│   ├── geminiService.ts        # Google Gemini AI streaming
│   └── meilisearchService.ts   # Meilisearch query handler
├── App.tsx              # Main application component
├── index.tsx            # React entry point
├── types.ts             # TypeScript type definitions
├── constants.ts         # Configuration and environment variables
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript compiler options
├── index.html           # HTML template with Tailwind CDN
├── package.json         # Dependencies and scripts
├── metadata.json        # AI Studio metadata
└── README.md            # Basic project documentation
```

---

## Configuration System

### Environment Variables (`.env.local`)

The application uses Vite environment variables with the `VITE_` prefix:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Meilisearch Configuration (with defaults)
VITE_MEILISEARCH_HOST=http://localhost:7700
VITE_MEILISEARCH_API_KEY=
VITE_MEILISEARCH_INDEX=movies

# Hybrid Search Configuration
VITE_MEILISEARCH_SEMANTIC_RATIO=0.5  # 0.0=keyword, 1.0=vector, 0.5=balanced
VITE_MEILISEARCH_EMBEDDER=default

# App Branding
VITE_APP_TITLE=Hybrid Search
VITE_APP_LOGO=  # Optional logo URL
```

### Constants (`constants.ts:1`)

- **CONFIG**: App configuration object with environment variable fallbacks
- **AI_MODEL_NAME**: `gemini-2.5-flash` (constants.ts:25)
- **MAX_CONTEXT_HITS**: `5` - Number of search results sent to AI for context (constants.ts:26)

### Special Vite Configuration (`vite.config.ts:1`)

- Remaps `process.env.API_KEY` to `GEMINI_API_KEY` for Gemini SDK compatibility (vite.config.ts:14)
- Path alias: `@/*` maps to project root (vite.config.ts:18-20)
- Dev server runs on `http://0.0.0.0:3000` (vite.config.ts:9-10)

---

## Type System (`types.ts:1`)

### Core Types

```typescript
// Search result from Meilisearch
MeiliSearchHit (types.ts:1-16)
  - Flexible schema with optional fields (title, content, description, url)
  - _formatted: Contains highlighted search matches
  - _rankingScore: Relevance score (0-1)

// Meilisearch API response
MeiliSearchResponse (types.ts:18-23)
  - hits: Array of search results
  - estimatedTotalHits, processingTimeMs, query

// UI State for search functionality
SearchState (types.ts:25-32)
  - Tracks query, results, loading, errors, timing

// UI State for AI summary
AISummaryState (types.ts:34-39)
  - Tracks streaming status, content, loading, errors

// App configuration
AppConfig (types.ts:41-50)
  - Meilisearch connection details
  - Hybrid search parameters (semanticRatio, embedder)
  - Branding (appTitle, appLogo)
```

---

## Architecture Patterns

### 1. State Management
- **Local State**: React `useState` hooks in main App component (App.tsx:14-29)
- **No Global State**: All state lives in `App.tsx` and flows down via props
- **Separation of Concerns**: Search state and AI state are independent

### 2. Service Layer Pattern
All external API calls are isolated in `/services`:
- `meilisearchService.ts:8`: Executes search queries with hybrid configuration
- `geminiService.ts:12`: Generates streaming AI summaries with async iterables

### 3. Component Structure
- **Presentational Components**: Accept props, render UI (no direct API calls)
- **Smart Component**: `App.tsx` handles all business logic and orchestration
- **Icon Components**: Reusable SVG components (components/Icons.tsx:1)

### 4. Async Patterns
- `async/await` for service calls
- **Async generators** for streaming AI responses (geminiService.ts:48-54)
- Error boundaries via try/catch with user-friendly error states

---

## Key Workflows

### Search Flow (App.tsx:36-68)

1. User submits query → `handleSearch()` called
2. Reset AI state, set loading state (App.tsx:40-43)
3. Call `searchMeili()` service (App.tsx:47)
4. Update UI with results (App.tsx:49-54)
5. If results exist, trigger AI summary (App.tsx:57-59)

### AI Summary Streaming (App.tsx:70-96)

1. `triggerAISummary()` takes top N results (MAX_CONTEXT_HITS)
2. Call `generateSearchSummaryStream()` with query + context
3. Set streaming state to true
4. Iterate through async stream, appending chunks to content
5. Set streaming state to false when complete

### UI Animation States
The app uses a **hero → header transition** triggered by `hasSearched` flag:
- **Before search**: Logo and search bar centered (App.tsx:127-129)
- **After search**: Logo top-left, search bar in header (App.tsx:125-126)
- Smooth 700ms transitions with cubic-bezier easing (App.tsx:125)

---

## Component Guidelines

### AISummary Component (`components/AISummary.tsx:10`)

**Purpose**: Display AI-generated search overview with streaming support

**Features**:
- Custom markdown parser for basic formatting (AISummary.tsx:16-50)
  - Bold text (`**text**`)
  - Bullet points (`- ` or `* `)
  - Numbered lists (`1. `)
- Loading skeleton with shimmer animation
- Error state with retry button
- Streaming indicator and pulse animations

**Props**:
- `state: AISummaryState` - Current AI state
- `onRetry?: () => void` - Optional retry handler

### ResultCard Component (`components/ResultCard.tsx:10`)

**Purpose**: Display individual search result with highlighting

**Features**:
- Dynamic title/content extraction with fallbacks (ResultCard.tsx:12-13)
- URL parsing and favicon display (ResultCard.tsx:15-29)
- Highlighted search terms via `dangerouslySetInnerHTML` (safe - controlled by Meilisearch)
- Ranking score badge (visible on hover)
- External link icon indicator

**Props**:
- `hit: MeiliSearchHit` - Search result data
- `index: number` - Result position

### ThemeToggle Component (`components/ThemeToggle.tsx:4`)

**Purpose**: Toggle between light/dark mode

**Behavior**:
- Checks `localStorage.theme` or system preference on mount (ThemeToggle.tsx:8-16)
- Toggles `dark` class on `<html>` element (ThemeToggle.tsx:10, 20, 24)
- Persists preference to localStorage (ThemeToggle.tsx:21, 25)

---

## Service Implementation Details

### Meilisearch Service (`services/meilisearchService.ts:8`)

**Search Configuration**:
```typescript
{
  q: query,
  limit: 20,
  attributesToHighlight: ['title', 'content', 'description'],
  highlightPreTag: '<span class="bg-yellow-200...">',  // Custom highlight styling
  highlightPostTag: '</span>',
  showRankingScore: true,
  hybrid: {
    semanticRatio: CONFIG.semanticRatio,  // 0.0-1.0
    embedder: CONFIG.embedder
  }
}
```

**Error Handling**: Throws descriptive errors with status code and response text (meilisearchService.ts:40)

### Gemini Service (`geminiService.ts:7`)

**API Key**: Uses `process.env.API_KEY` (remapped from GEMINI_API_KEY in Vite config)

**Prompt Engineering** (geminiService.ts:24-36):
- Instructs model to cite sources using `[1], [2]` format
- Requests markdown formatting
- Asks to acknowledge when search results don't contain answer
- Includes numbered context from top search results

**Streaming Implementation**:
- Returns async iterable of text chunks
- Generator pattern for memory-efficient streaming (geminiService.ts:48-54)

---

## Styling Conventions

### TailwindCSS Usage
- **CDN-based**: Configured in `index.html` script tag (index.html:12-35)
- **Dark mode**: Class-based (`class="dark"`) toggled on `<html>` element
- **Custom colors**: Indigo primary theme (index.html:20-31)
- **Responsive**: Mobile-first with `sm:`, `lg:` breakpoints

### Common Patterns
```css
/* Smooth transitions */
transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)

/* Dark mode variants */
bg-white dark:bg-slate-900
text-slate-900 dark:text-slate-100

/* Hover effects */
hover:bg-slate-50 dark:hover:bg-white/5

/* Gradients for AI components */
bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-slate-800

/* Glass morphism */
bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
```

### Custom Styles (`index.html:37-76`)
- Custom scrollbar styling for light/dark mode
- Markdown body styles for lists and formatting

---

## Development Workflow

### Setup
```bash
npm install                    # Install dependencies
# Create .env.local and add GEMINI_API_KEY
npm run dev                    # Start dev server on :3000
```

### Scripts
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Production build to `/dist`
- `npm run preview` - Preview production build locally

### Build Process
1. Vite processes TypeScript → JavaScript (ES modules)
2. Environment variables injected via `define` config (vite.config.ts:13-16)
3. Import maps in HTML handle external dependencies (index.html:77-86)
4. Output: Optimized bundle in `/dist`

---

## Adding New Features

### Adding a New Component

1. Create file in `/components/ComponentName.tsx`
2. Define props interface
3. Export as default
4. Follow existing patterns:
   - Functional component with TypeScript
   - Props destructuring
   - Tailwind for styling
   - Dark mode variants

Example:
```typescript
import React from 'react';

interface MyComponentProps {
  data: string;
  onClick?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ data, onClick }) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800">
      {data}
    </div>
  );
};

export default MyComponent;
```

### Adding a New Service

1. Create file in `/services/serviceName.ts`
2. Export async functions
3. Add type definitions to `types.ts` if needed
4. Handle errors with try/catch
5. Import in `App.tsx` and use in handlers

### Adding Environment Variables

1. Add to `.env.local` with `VITE_` prefix
2. Add to `AppConfig` type in `types.ts`
3. Add to `CONFIG` object in `constants.ts` with fallback
4. Access via `CONFIG.yourVariable`

**Special case for Gemini**: Use `process.env.API_KEY` (handled by Vite config)

---

## Common Modification Tasks

### Change Search Results Limit
- Modify `limit: 20` in `meilisearchService.ts:24`

### Change AI Context Window
- Modify `MAX_CONTEXT_HITS` in `constants.ts:26`

### Change AI Model
- Modify `AI_MODEL_NAME` in `constants.ts:25`
- Ensure model supports streaming

### Customize Highlight Colors
- Modify `highlightPreTag` classes in `meilisearchService.ts:26`

### Change Theme Colors
- Update Tailwind config in `index.html:12-35`
- Replace `indigo` color references throughout components

### Adjust Search Sensitivity
- Modify `VITE_MEILISEARCH_SEMANTIC_RATIO` in `.env.local`
  - `0.0` = Pure keyword search
  - `1.0` = Pure vector/semantic search
  - `0.5` = Balanced hybrid (default)

---

## Code Quality Standards

### TypeScript
- **Strict mode enabled**: `isolatedModules: true` (tsconfig.json:17)
- **No `any` without reason**: Prefer explicit types
- **Interface over type**: Use `interface` for object shapes
- **Optional chaining**: Use `?.` for potentially undefined properties

### React Patterns
- **Functional components only**: No class components
- **Hooks**: Use `useState`, `useCallback`, `useEffect` appropriately
- **Memoization**: `useCallback` for functions passed to child components (App.tsx:36)
- **Refs**: `useRef` for non-reactive values (App.tsx:32)

### Error Handling
- User-facing errors in state (SearchState.error, AISummaryState.error)
- Console.error for debugging (App.tsx:88, meilisearchService.ts:53)
- Try/catch around all async operations
- Graceful fallbacks (e.g., "Untitled Document" in ResultCard.tsx:12)

### File Organization
- One component per file
- Named exports for utilities, default export for components
- Imports ordered: React → External → Internal → Types → Styles
- Path alias `@/` available but not extensively used

---

## Testing Considerations

### Manual Testing Checklist
- [ ] Search with various queries (empty, special chars, long text)
- [ ] Dark mode toggle persistence across refreshes
- [ ] AI summary streaming and error states
- [ ] Result highlighting with different match types
- [ ] Mobile responsive behavior (search bar, cards)
- [ ] Error states (no results, API failures)

### Environment Testing
- Test with missing Meilisearch (should show error)
- Test with invalid Gemini API key (should show AI error)
- Test with different `semanticRatio` values (0.0, 0.5, 1.0)

---

## Important Constraints

### Security
- **No XSS**: HTML rendering via `dangerouslySetInnerHTML` is safe (controlled by Meilisearch highlights only)
- **API Keys**: Never commit `.env.local` to git (already in .gitignore)
- **CORS**: Meilisearch host must allow frontend origin

### Performance
- **Streaming**: AI responses stream for better UX (no waiting for full response)
- **Debouncing**: Not currently implemented (search only on form submit)
- **Pagination**: Not implemented (shows top 20 results only)

### Browser Support
- Modern browsers with ES2022 support (tsconfig.json:3)
- CSS Grid, Flexbox, CSS Variables required
- Tailwind CDN requires JavaScript enabled

---

## Deployment Notes

### Environment Setup
- Ensure all `VITE_*` env vars are set in hosting platform
- `GEMINI_API_KEY` must be provided at build time
- Meilisearch instance must be accessible from frontend

### Build Output
- Static files in `/dist` after `npm run build`
- SPA routing: Configure server to serve `index.html` for all routes
- Assets use relative paths

### AI Studio Deployment
- `metadata.json` contains AI Studio configuration
- Import maps use `aistudiocdn.com` for dependencies (index.html:77-86)
- `requestFramePermissions: []` - No special permissions needed

---

## Troubleshooting Guide

### "Meilisearch Error: 404"
- Check `VITE_MEILISEARCH_INDEX` matches existing index
- Verify Meilisearch host is accessible

### "Failed to generate AI summary"
- Verify `GEMINI_API_KEY` in `.env.local`
- Check browser console for detailed error
- Ensure API key has Gemini API access enabled

### Highlights not showing
- Verify Meilisearch index has `searchableAttributes` configured
- Check `attributesToHighlight` matches index schema

### Dark mode not persisting
- Check browser localStorage is enabled
- Verify `localStorage.theme` is being set (DevTools → Application → Local Storage)

---

## Quick Reference

### File Navigation
- Search logic: `App.tsx:36-68`
- AI streaming: `App.tsx:70-96`, `geminiService.ts:12-62`
- Meilisearch query: `meilisearchService.ts:8-56`
- Type definitions: `types.ts:1-50`
- Environment config: `constants.ts:11-22`

### Common Values
- Default Meilisearch port: `7700`
- Dev server port: `3000`
- Search result limit: `20`
- AI context limit: `5` results
- Transition duration: `700ms`

### Key Dependencies
- React 19.2.1 (latest)
- @google/genai 1.32.0
- Vite 6.2.0
- TypeScript 5.8.2

---

## Version History & Changelog

This codebase appears to be at version `0.0.0` (package.json:4) - initial development phase.

### Current State (as of analysis)
- Fully functional hybrid search interface
- Streaming AI summaries working
- Dark mode implemented
- Responsive design complete
- Production-ready for AI Studio deployment

---

## Resources & Documentation

- [Meilisearch Documentation](https://www.meilisearch.com/docs)
- [Meilisearch Hybrid Search Guide](https://www.meilisearch.com/docs/learn/ai_powered_search/hybrid_search)
- [Google Gemini API](https://ai.google.dev/docs)
- [Vite Documentation](https://vite.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [React 19 Docs](https://react.dev/)

---

**Last Updated**: December 2025
**For AI Assistants**: This guide provides comprehensive context for understanding and modifying the codebase. Always read existing code before suggesting changes. Follow established patterns and conventions.
