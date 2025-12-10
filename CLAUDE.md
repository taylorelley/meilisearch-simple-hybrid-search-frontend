# CLAUDE.md - AI Assistant Guide

## Project Overview

**Meilisearch Hybrid Search** is a modern search interface that leverages Meilisearch's hybrid search capabilities (keyword + vector/semantic search) to provide intelligent search results. Built with React, TypeScript, and Vite.

### Key Features
- Hybrid search using Meilisearch (configurable semantic vs keyword ratio)
- Dynamic UI with smooth transitions between search states
- Dark mode support with system preference detection
- Responsive design with TailwindCSS
- Search result highlighting with ranking scores

---

## Tech Stack

- **Frontend Framework**: React 19.2.1 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: TailwindCSS (CDN) + Inter font
- **Search Engine**: Meilisearch (hybrid search with vector embeddings)
- **Type Safety**: TypeScript with strict configuration
- **Module System**: ES Modules (ESNext)

---

## Codebase Structure

```
/
├── components/           # React UI components
│   ├── ResultCard.tsx   # Individual search result display
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   └── Icons.tsx        # SVG icon components
├── services/            # External API integrations
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
  - `meiliHost`: Meilisearch server URL
  - `meiliKey`: Meilisearch API key
  - `meiliIndex`: Index name to search
  - `semanticRatio`: Hybrid search ratio (0.0-1.0)
  - `embedder`: Embedder name for vector search
  - `appTitle`: Application title
  - `appLogo`: Optional logo URL

### Vite Configuration (`vite.config.ts:1`)

- Path alias: `@/*` maps to project root
- Dev server runs on `http://0.0.0.0:3000`

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

// App configuration
AppConfig (types.ts:34-42)
  - Meilisearch connection details
  - Hybrid search parameters (semanticRatio, embedder)
  - Branding (appTitle, appLogo)
```

---

## Architecture Patterns

### 1. State Management
- **Local State**: React `useState` hooks in main App component (App.tsx:11-19)
- **No Global State**: All state lives in `App.tsx` and flows down via props
- **Simple Architecture**: Single search state manages entire UI

### 2. Service Layer Pattern
All external API calls are isolated in `/services`:
- `meilisearchService.ts:8`: Executes search queries with hybrid configuration

### 3. Component Structure
- **Presentational Components**: Accept props, render UI (no direct API calls)
- **Smart Component**: `App.tsx` handles all business logic and orchestration
- **Icon Components**: Reusable SVG components (components/Icons.tsx:1)

### 4. Async Patterns
- `async/await` for service calls
- Error boundaries via try/catch with user-friendly error states

---

## Key Workflows

### Search Flow (App.tsx:26-50)

1. User submits query → `handleSearch()` called
2. Set loading state (App.tsx:29-30)
3. Call `searchMeili()` service (App.tsx:33-34)
4. Update UI with results (App.tsx:36-41)
5. Handle errors gracefully (App.tsx:43-48)

### UI Animation States
The app uses a **hero → header transition** triggered by `hasSearched` flag:
- **Before search**: Logo and search bar centered (App.tsx:127-129)
- **After search**: Logo top-left, search bar in header (App.tsx:125-126)
- Smooth 700ms transitions with cubic-bezier easing (App.tsx:125)

---

## Component Guidelines

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

---

## Styling Conventions

### TailwindCSS Usage
- **CDN-based**: Configured in `index.html` script tag
- **Dark mode**: Class-based (`class="dark"`) toggled on `<html>` element
- **Custom colors**: Indigo primary theme
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

/* Glass morphism */
bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
```

### Custom Styles (`index.html`)
- Custom scrollbar styling for light/dark mode
- Markdown body styles for lists and formatting

---

## Development Workflow

### Setup
```bash
npm install                    # Install dependencies
# Create .env.local and add Meilisearch configuration
npm run dev                    # Start dev server on :3000
```

### Scripts
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Production build to `/dist`
- `npm run preview` - Preview production build locally

### Build Process
1. Vite processes TypeScript → JavaScript (ES modules)
2. Environment variables injected via Vite's env system
3. Import maps in HTML handle external dependencies
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

---

## Common Modification Tasks

### Change Search Results Limit
- Modify `limit: 20` in `meilisearchService.ts:24`

### Customize Highlight Colors
- Modify `highlightPreTag` classes in `meilisearchService.ts:26`

### Change Theme Colors
- Update Tailwind config in `index.html`
- Replace `indigo` color references throughout components

### Adjust Search Sensitivity
- Modify `VITE_MEILISEARCH_SEMANTIC_RATIO` in `.env.local`
  - `0.0` = Pure keyword search
  - `1.0` = Pure vector/semantic search
  - `0.5` = Balanced hybrid (default)

---

## Code Quality Standards

### TypeScript
- **Strict mode enabled**: `isolatedModules: true`
- **No `any` without reason**: Prefer explicit types
- **Interface over type**: Use `interface` for object shapes
- **Optional chaining**: Use `?.` for potentially undefined properties

### React Patterns
- **Functional components only**: No class components
- **Hooks**: Use `useState`, `useCallback`, `useEffect` appropriately
- **Memoization**: `useCallback` for functions passed to child components
- **Refs**: `useRef` for non-reactive values

### Error Handling
- User-facing errors in state (SearchState.error)
- Console.error for debugging
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
- [ ] Result highlighting with different match types
- [ ] Mobile responsive behavior (search bar, cards)
- [ ] Error states (no results, API failures)
- [ ] Different semantic ratio values (0.0, 0.5, 1.0)

### Environment Testing
- Test with missing Meilisearch (should show error)
- Test with different `semanticRatio` values (0.0, 0.5, 1.0)
- Test with different indices and data structures

---

## Important Constraints

### Security
- **No XSS**: HTML rendering via `dangerouslySetInnerHTML` is safe (controlled by Meilisearch highlights only)
- **API Keys**: Never commit `.env.local` to git (already in .gitignore)
- **CORS**: Meilisearch host must allow frontend origin

### Performance
- **Debouncing**: Not currently implemented (search only on form submit)
- **Pagination**: Not implemented (shows top 20 results only)
- **Caching**: No client-side caching (each search queries Meilisearch)

### Browser Support
- Modern browsers with ES2022 support
- CSS Grid, Flexbox, CSS Variables required
- Tailwind CDN requires JavaScript enabled

---

## Deployment Notes

### Environment Setup
- Ensure all `VITE_*` env vars are set in hosting platform
- Meilisearch instance must be accessible from frontend
- Configure CORS on Meilisearch to allow frontend origin

### Build Output
- Static files in `/dist` after `npm run build`
- SPA routing: Configure server to serve `index.html` for all routes
- Assets use relative paths

### AI Studio Deployment
- `metadata.json` contains AI Studio configuration
- Import maps use `aistudiocdn.com` for dependencies
- `requestFramePermissions: []` - No special permissions needed

---

## Troubleshooting Guide

### "Meilisearch Error: 404"
- Check `VITE_MEILISEARCH_INDEX` matches existing index
- Verify Meilisearch host is accessible

### Highlights not showing
- Verify Meilisearch index has `searchableAttributes` configured
- Check `attributesToHighlight` matches index schema

### Dark mode not persisting
- Check browser localStorage is enabled
- Verify `localStorage.theme` is being set (DevTools → Application → Local Storage)

### Hybrid search not working
- Ensure Meilisearch instance has vector embeddings configured
- Verify `embedder` name matches your Meilisearch configuration
- Check that your index has been processed with embeddings

---

## Quick Reference

### File Navigation
- Search logic: `App.tsx:26-50`
- Meilisearch query: `meilisearchService.ts:8-56`
- Type definitions: `types.ts:1-42`
- Environment config: `constants.ts:11-22`

### Common Values
- Default Meilisearch port: `7700`
- Dev server port: `3000`
- Search result limit: `20`
- Transition duration: `700ms`

### Key Dependencies
- React 19.2.1 (latest)
- Vite 6.2.0
- TypeScript 5.8.2

---

## Version History & Changelog

This codebase is at version `0.0.0` (package.json:4) - initial development phase.

### Current State
- Fully functional hybrid search interface
- Dark mode implemented
- Responsive design complete
- Production-ready for deployment

---

## Resources & Documentation

- [Meilisearch Documentation](https://www.meilisearch.com/docs)
- [Meilisearch Hybrid Search Guide](https://www.meilisearch.com/docs/learn/ai_powered_search/hybrid_search)
- [Vite Documentation](https://vite.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [React 19 Docs](https://react.dev/)

---

**Last Updated**: December 2025
**For AI Assistants**: This guide provides comprehensive context for understanding and modifying the codebase. Always read existing code before suggesting changes. Follow established patterns and conventions.
