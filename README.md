<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Meilisearch Hybrid Search Frontend

A modern search interface that leverages Meilisearch's hybrid search capabilities (keyword + vector/semantic search) to provide intelligent search results. Built with React, TypeScript, and Vite.

[![CI](https://github.com/taylorelley/meilisearch-simple-hybrid-search-frontend/workflows/CI/badge.svg)](https://github.com/taylorelley/meilisearch-simple-hybrid-search-frontend/actions)
[![Docker Build](https://github.com/taylorelley/meilisearch-simple-hybrid-search-frontend/workflows/Docker%20Build/badge.svg)](https://github.com/taylorelley/meilisearch-simple-hybrid-search-frontend/actions)

## Features

- 🔍 **Hybrid Search**: Combines keyword and semantic/vector search
- ⚡ **Fast & Responsive**: Built with React 19 and Vite 6
- 🎨 **Modern UI**: Smooth transitions and dark mode support
- 🔧 **Configurable**: Adjust semantic ratio, embedder, and more
- 🐳 **Docker Ready**: Full Docker and Docker Compose support
- 🚀 **Production Ready**: Optimized builds with Nginx

---

## Quick Start

### Option 1: Run with Docker Compose (Recommended)

**Prerequisites:** Docker and Docker Compose

```bash
# Start both frontend and Meilisearch
docker compose up

# Access the app at http://localhost:3000
# Meilisearch is available at http://localhost:7700
```

For development with hot-reload:

```bash
# Start development server
docker compose --profile development up dev

# Access dev server at http://localhost:3001
```

### Option 2: Run Locally

**Prerequisites:** Node.js 18+ and a running Meilisearch instance

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create a `.env.local` file:
   ```env
   VITE_MEILISEARCH_HOST=http://localhost:7700
   VITE_MEILISEARCH_API_KEY=your_api_key_here
   VITE_MEILISEARCH_INDEX=movies
   VITE_MEILISEARCH_SEMANTIC_RATIO=0.5
   VITE_APP_TITLE=Hybrid Search
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   Open http://localhost:3000

---

## Docker Usage

### Build Production Image

```bash
docker build -t meilisearch-hybrid-search .
docker run -p 3000:80 meilisearch-hybrid-search
```

### Docker Compose Services

- `frontend` - Production-ready Nginx server (port 3000)
- `meilisearch` - Meilisearch instance (port 7700)
- `dev` - Development server with hot-reload (port 3001) - requires `--profile development`

### Environment Variables

Configure via `.env` file or docker-compose environment section:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_MEILISEARCH_HOST` | `http://localhost:7700` | Meilisearch server URL |
| `VITE_MEILISEARCH_API_KEY` | - | Meilisearch API key |
| `VITE_MEILISEARCH_INDEX` | `movies` | Index name to search |
| `VITE_MEILISEARCH_SEMANTIC_RATIO` | `0.5` | Hybrid search ratio (0.0-1.0) |
| `VITE_MEILISEARCH_EMBEDDER` | `default` | Embedder name |
| `VITE_APP_TITLE` | `Hybrid Search` | Application title |
| `VITE_APP_LOGO` | - | Optional logo URL |

**Semantic Ratio:**
- `0.0` = Pure keyword search
- `0.5` = Balanced hybrid (default)
- `1.0` = Pure vector/semantic search

---

## Development

### Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Project Structure

```
/
├── components/           # React UI components
│   ├── ResultCard.tsx   # Search result display
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   └── Icons.tsx        # SVG icons
├── services/            # API integrations
│   └── meilisearchService.ts
├── .github/workflows/   # CI/CD workflows
│   ├── ci.yml          # Build and test pipeline
│   └── docker.yml      # Docker build validation
├── App.tsx              # Main component
├── types.ts             # TypeScript definitions
├── constants.ts         # Configuration
├── Dockerfile           # Production build
├── docker-compose.yml   # Local development
└── nginx.conf           # Production web server
```

### Code Quality

This project includes automated CI checks:

- ✅ TypeScript type checking
- ✅ Build validation
- ✅ Security audits
- ✅ Docker image builds
- ✅ Docker Compose validation

View workflows in [`.github/workflows/`](.github/workflows/)

---

## Configuration Guide

### Meilisearch Setup

1. **Start Meilisearch:**
   ```bash
   docker compose up meilisearch -d
   ```

2. **Create an index and add documents:**
   ```bash
   curl -X POST 'http://localhost:7700/indexes' \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer masterKey' \
     --data-binary '{"uid": "movies", "primaryKey": "id"}'
   ```

3. **Configure vector embeddings** (optional for semantic search):
   See [Meilisearch Vector Search Docs](https://www.meilisearch.com/docs/learn/ai_powered_search/getting_started_with_ai_search)

### Adjusting Search Behavior

Edit `.env.local`:

```env
# More keyword-focused (better for exact matches)
VITE_MEILISEARCH_SEMANTIC_RATIO=0.2

# More semantic-focused (better for conceptual matches)
VITE_MEILISEARCH_SEMANTIC_RATIO=0.8
```

---

## Production Deployment

### Building for Production

```bash
npm run build
```

Output files are in `dist/` directory.

### Deploy with Docker

```bash
# Build and tag
docker build -t your-registry/meilisearch-hybrid-search:latest .

# Push to registry
docker push your-registry/meilisearch-hybrid-search:latest

# Deploy
docker run -d \
  -p 80:80 \
  -e VITE_MEILISEARCH_HOST=https://your-meilisearch.com \
  your-registry/meilisearch-hybrid-search:latest
```

### Static Hosting

The `dist/` folder can be deployed to any static hosting provider:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

---

## Troubleshooting

### Docker Build Fails

Ensure `package-lock.json` exists:
```bash
npm install  # Generates package-lock.json
```

### Meilisearch Connection Error

1. Check Meilisearch is running:
   ```bash
   curl http://localhost:7700/health
   ```

2. Verify `VITE_MEILISEARCH_HOST` in `.env.local`

3. Check CORS settings on Meilisearch

### No Search Results

1. Verify index exists and has documents
2. Check `VITE_MEILISEARCH_INDEX` matches your index name
3. For semantic search, ensure embeddings are configured

---

## Contributing

Contributions are welcome! Please ensure:

1. All CI checks pass
2. Code follows existing patterns (see `CLAUDE.md`)
3. Docker builds successfully
4. TypeScript has no errors

---

## Resources

- [Meilisearch Documentation](https://www.meilisearch.com/docs)
- [Meilisearch Hybrid Search Guide](https://www.meilisearch.com/docs/learn/ai_powered_search/hybrid_search)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)

---

## License

This project is open source and available under the MIT License.
