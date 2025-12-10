# Meilisearch Hybrid Search Frontend

A modern, production-ready search interface that combines **keyword** and **semantic (vector) search** using Meilisearch's powerful hybrid search capabilities. Built with React 19, TypeScript, and Vite for blazing-fast performance.

[![CI](https://github.com/taylorelley/meilisearch-simple-hybrid-search-frontend/workflows/CI/badge.svg)](https://github.com/taylorelley/meilisearch-simple-hybrid-search-frontend/actions)
[![Docker Build](https://github.com/taylorelley/meilisearch-simple-hybrid-search-frontend/workflows/Docker%20Build/badge.svg)](https://github.com/taylorelley/meilisearch-simple-hybrid-search-frontend/actions)

---

## ✨ Features

- 🔍 **Hybrid Search** - Intelligently combines keyword matching with semantic understanding
- ⚡ **Lightning Fast** - Built with React 19, Vite 6, and optimized for performance
- 🎨 **Beautiful UI** - Smooth transitions, result highlighting, and dark mode support
- 🔧 **Highly Configurable** - Adjust semantic ratio, embedder, branding, and more
- 🐳 **Docker Ready** - Full Docker and Docker Compose support with runtime configuration
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🚀 **Production Ready** - Optimized builds served with Nginx, CI/CD pipelines included
- 🎯 **Zero Config Start** - Works out of the box with sensible defaults

---

## 📋 Table of Contents

- [What is Hybrid Search?](#-what-is-hybrid-search)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Docker Usage](#-docker-usage)
- [Configuration](#-configuration)
- [Development](#-development)
- [Production Deployment](#-production-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🤔 What is Hybrid Search?

Hybrid search combines two powerful search methods:

1. **Keyword Search (Lexical)** - Traditional search that matches exact terms
   - Great for: Product codes, names, specific phrases
   - Example: Searching "iPhone 15" finds exact matches

2. **Semantic Search (Vector)** - AI-powered search that understands meaning
   - Great for: Concepts, questions, natural language
   - Example: Searching "smartphone with good camera" finds relevant products even without those exact words

**The Magic**: By combining both approaches, you get the best of both worlds. The `semanticRatio` parameter (0.0-1.0) lets you control the balance:

```
0.0 ───────── 0.5 ───────── 1.0
Pure         Balanced      Pure
Keyword      Hybrid        Semantic
```

---

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19.2.1 with TypeScript 5.8.2 |
| **Build Tool** | Vite 6.2.0 (Lightning-fast HMR) |
| **Styling** | TailwindCSS 3+ (CDN) with custom dark mode |
| **Search Engine** | Meilisearch with hybrid search |
| **Production Server** | Nginx (Alpine-based Docker image) |
| **Type Safety** | Strict TypeScript with ESNext modules |
| **CI/CD** | GitHub Actions (build, test, Docker) |

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

Get up and running in seconds with both frontend and Meilisearch:

```bash
# Clone the repository
git clone https://github.com/taylorelley/meilisearch-simple-hybrid-search-frontend.git
cd meilisearch-simple-hybrid-search-frontend

# Start everything with Docker Compose
docker compose up

# 🎉 Open http://localhost:3000 in your browser
```

**What you get:**
- Frontend at http://localhost:3000
- Meilisearch at http://localhost:7700
- Ready-to-use environment with sample configuration

### Option 2: Use Pre-built Docker Image

Pull and run the latest published image:

```bash
docker pull ghcr.io/taylorelley/meilisearch-simple-hybrid-search-frontend:latest

docker run -d \
  -p 3000:80 \
  -e VITE_MEILISEARCH_HOST=http://localhost:7700 \
  -e VITE_MEILISEARCH_INDEX=movies \
  -e VITE_APP_TITLE="My Search App" \
  ghcr.io/taylorelley/meilisearch-simple-hybrid-search-frontend:latest
```

### Option 3: Local Development

**Prerequisites:** Node.js 18+ and a running Meilisearch instance

```bash
# Install dependencies
npm install

# Create configuration file
cat > .env.local << EOF
VITE_MEILISEARCH_HOST=http://localhost:7700
VITE_MEILISEARCH_API_KEY=
VITE_MEILISEARCH_INDEX=movies
VITE_MEILISEARCH_SEMANTIC_RATIO=0.5
VITE_APP_TITLE=Hybrid Search
EOF

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 🐳 Docker Usage

### Development Mode (Hot Reload)

Perfect for local development with instant updates:

```bash
# Start dev server with hot-reload
docker compose --profile development up dev

# Access at http://localhost:3001
# Changes to source files reload automatically
```

### Production Mode

Optimized build served by Nginx:

```bash
# Start production frontend
docker compose up frontend

# Access at http://localhost:3000
```

### Custom Configuration

All configuration can be set at runtime via environment variables:

```bash
docker run -d \
  -p 3000:80 \
  -e VITE_MEILISEARCH_HOST=https://search.example.com \
  -e VITE_MEILISEARCH_API_KEY=your-api-key \
  -e VITE_MEILISEARCH_INDEX=products \
  -e VITE_MEILISEARCH_SEMANTIC_RATIO=0.7 \
  -e VITE_APP_TITLE="Product Search" \
  -e VITE_APP_LOGO=https://example.com/logo.png \
  ghcr.io/taylorelley/meilisearch-simple-hybrid-search-frontend:latest
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file (local development) or set environment variables (Docker):

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_MEILISEARCH_HOST` | `http://localhost:7700` | Meilisearch server URL |
| `VITE_MEILISEARCH_API_KEY` | - | Meilisearch API key (optional for development) |
| `VITE_MEILISEARCH_INDEX` | `movies` | Index name to search |
| `VITE_MEILISEARCH_SEMANTIC_RATIO` | `0.5` | Hybrid search balance (0.0-1.0) |
| `VITE_MEILISEARCH_EMBEDDER` | `default` | Vector embedder name |
| `VITE_APP_TITLE` | `Hybrid Search` | Application title (shown in header) |
| `VITE_APP_LOGO` | - | Optional logo URL |

### Understanding Semantic Ratio

The `VITE_MEILISEARCH_SEMANTIC_RATIO` parameter is crucial for tuning search behavior:

| Ratio | Behavior | Best For |
|-------|----------|----------|
| `0.0` | **Pure Keyword** - Exact term matching only | SKUs, codes, exact names |
| `0.3` | **Keyword-Heavy** - Mostly exact, some context | E-commerce, technical docs |
| `0.5` | **Balanced** - Equal mix (default) | General purpose search |
| `0.7` | **Semantic-Heavy** - Mostly meaning-based | Q&A, support articles |
| `1.0` | **Pure Semantic** - Concept matching only | Natural language queries |

**Example Scenarios:**

```env
# E-commerce site with product codes
VITE_MEILISEARCH_SEMANTIC_RATIO=0.2

# Knowledge base / FAQ
VITE_MEILISEARCH_SEMANTIC_RATIO=0.8

# General content search
VITE_MEILISEARCH_SEMANTIC_RATIO=0.5
```

### Meilisearch Setup

1. **Start Meilisearch** (if using Docker Compose, it's already running):
   ```bash
   docker compose up meilisearch -d
   ```

2. **Create an index**:
   ```bash
   curl -X POST 'http://localhost:7700/indexes' \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer masterKey' \
     --data-binary '{
       "uid": "movies",
       "primaryKey": "id"
     }'
   ```

3. **Add sample documents**:
   ```bash
   curl -X POST 'http://localhost:7700/indexes/movies/documents' \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer masterKey' \
     --data-binary '[
       {
         "id": 1,
         "title": "The Shawshank Redemption",
         "description": "Two imprisoned men bond over a number of years...",
         "url": "https://example.com/movies/1"
       }
     ]'
   ```

4. **Configure vector embeddings** (for semantic search):
   - See [Meilisearch AI Search Guide](https://www.meilisearch.com/docs/learn/ai_powered_search/getting_started_with_ai_search)
   - Configure an embedder in your Meilisearch settings
   - Set `VITE_MEILISEARCH_EMBEDDER` to match your embedder name

---

## 💻 Development

### Available Scripts

```bash
npm run dev      # Start Vite dev server on port 3000
npm run build    # Build optimized production bundle
npm run preview  # Preview production build locally
```

### Project Structure

```
/
├── components/              # React UI components
│   ├── ResultCard.tsx      # Individual search result display
│   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   └── Icons.tsx           # SVG icon components
├── services/               # External API integrations
│   └── meilisearchService.ts  # Meilisearch query handler
├── .github/workflows/      # CI/CD automation
│   ├── ci.yml             # TypeScript checks, builds, security audits
│   └── docker.yml         # Docker image builds and publishing
├── App.tsx                 # Main application component
├── index.tsx               # React entry point
├── types.ts                # TypeScript type definitions
├── constants.ts            # Configuration and env variables
├── vite.config.ts          # Vite build configuration
├── Dockerfile              # Production Docker image (multi-stage)
├── docker-compose.yml      # Local development orchestration
├── nginx.conf              # Production web server config
└── CLAUDE.md              # Comprehensive AI assistant guide
```

### Code Quality

Automated CI checks on every push:

- ✅ TypeScript strict mode compilation
- ✅ Production build validation
- ✅ Security audit (`npm audit`)
- ✅ Docker image builds
- ✅ Docker Compose validation

### Development Guidelines

- **Read before modifying**: Check `CLAUDE.md` for architecture patterns
- **TypeScript strict mode**: No `any` types without justification
- **Component style**: Functional components with hooks only
- **Styling**: TailwindCSS utilities with dark mode support
- **Error handling**: Try/catch around all async operations

---

## 🚢 Production Deployment

### Static Hosting

Build and deploy to any static host:

```bash
# Build production bundle
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - GitHub Pages
# - Azure Static Web Apps
```

### Docker Deployment

```bash
# Build production image
docker build -t myapp/search:latest .

# Push to registry
docker push myapp/search:latest

# Deploy on your infrastructure
docker run -d \
  -p 80:80 \
  -e VITE_MEILISEARCH_HOST=https://search.production.com \
  -e VITE_MEILISEARCH_API_KEY=$SEARCH_API_KEY \
  myapp/search:latest
```

### Environment Considerations

**Security:**
- Never commit `.env.local` to version control (already in `.gitignore`)
- Use API keys with appropriate permissions in production
- Configure Meilisearch CORS to allow your frontend origin

**Performance:**
- Docker image is optimized (~25MB for Nginx + built assets)
- Static assets are served with gzip compression
- Consider CDN for global distribution

**Monitoring:**
- Monitor Meilisearch response times
- Track search query patterns
- Set up error logging (Sentry, LogRocket, etc.)

---

## 🔧 Troubleshooting

### "Cannot connect to Meilisearch"

**Symptoms:** Error message on page load

**Solutions:**
1. Check Meilisearch is running:
   ```bash
   curl http://localhost:7700/health
   ```
2. Verify `VITE_MEILISEARCH_HOST` in `.env.local`
3. Check CORS settings on Meilisearch
4. Ensure API key is correct (if using authentication)

### No Search Results

**Symptoms:** Empty results for valid queries

**Solutions:**
1. Verify index exists and has documents:
   ```bash
   curl http://localhost:7700/indexes/movies/stats
   ```
2. Check `VITE_MEILISEARCH_INDEX` matches your index name
3. For semantic search, ensure embeddings are configured
4. Check Meilisearch logs for errors

### Docker Build Fails

**Symptoms:** `npm install` fails during Docker build

**Solutions:**
```bash
# Ensure package-lock.json exists
npm install

# Clear Docker cache and rebuild
docker build --no-cache -t myapp .
```

### Dark Mode Not Persisting

**Symptoms:** Theme resets on page reload

**Solutions:**
1. Check browser localStorage is enabled
2. Open DevTools → Application → Local Storage
3. Verify `theme` key is being set
4. Check for browser extensions blocking localStorage

### Semantic Search Not Working

**Symptoms:** Search results don't seem to understand meaning

**Solutions:**
1. Verify your Meilisearch instance has embeddings configured
2. Check that `VITE_MEILISEARCH_EMBEDDER` matches your Meilisearch config
3. Ensure your index has been processed with vector embeddings
4. Try increasing `VITE_MEILISEARCH_SEMANTIC_RATIO` (e.g., 0.8)

### TypeScript Errors During Development

**Symptoms:** IDE shows type errors

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make your changes** following the code style in `CLAUDE.md`
4. **Test thoroughly**:
   - Build succeeds: `npm run build`
   - TypeScript compiles: `npx tsc --noEmit`
   - Docker builds: `docker build -t test .`
5. **Commit with clear messages**: `git commit -m "Add: feature description"`
6. **Push to your fork**: `git push origin feature/my-feature`
7. **Open a Pull Request**

### Code Guidelines

- Follow existing patterns (see `CLAUDE.md` for details)
- Write TypeScript with proper types (no `any`)
- Use functional React components with hooks
- Include dark mode support for new UI elements
- Test with different `semanticRatio` values
- Ensure Docker builds successfully

---

## 📚 Resources

### Official Documentation
- [Meilisearch Documentation](https://www.meilisearch.com/docs)
- [Meilisearch Hybrid Search Guide](https://www.meilisearch.com/docs/learn/ai_powered_search/hybrid_search)
- [Meilisearch Vector Search](https://www.meilisearch.com/docs/learn/ai_powered_search/getting_started_with_ai_search)
- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS](https://tailwindcss.com/)

### Project-Specific
- [CLAUDE.md](./CLAUDE.md) - Comprehensive guide for AI assistants and developers
- [CI/CD Workflows](./.github/workflows/) - Automated pipeline configurations
- [Docker Configuration](./Dockerfile) - Production build details

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Built with:
- [Meilisearch](https://www.meilisearch.com/) - The amazing search engine that powers this
- [React](https://react.dev/) - UI framework
- [Vite](https://vite.dev/) - Build tool
- [TailwindCSS](https://tailwindcss.com/) - Styling utilities

---

<div align="center">

**[⬆ Back to Top](#meilisearch-hybrid-search-frontend)**

Made with ❤️ for better search experiences

</div>
