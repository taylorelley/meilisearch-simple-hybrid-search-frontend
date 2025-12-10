# Docker Deployment Guide

This guide covers deploying the MeiliGemini Hybrid Search application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose 2.0+ ([Install Docker Compose](https://docs.docker.com/compose/install/))
- Google Gemini API key ([Get API key](https://aistudio.google.com/apikey))

## Quick Start

### 1. Configure Environment Variables

Copy the `.env` file and update with your credentials:

```bash
# Edit .env and replace placeholder values
nano .env
```

**Required variables:**
- `GEMINI_API_KEY` - Your Google Gemini API key
- `MEILI_MASTER_KEY` - Generate with: `openssl rand -base64 32`
- `VITE_MEILISEARCH_API_KEY` - Should match `MEILI_MASTER_KEY`

**Optional variables:**
- `VITE_MEILISEARCH_INDEX` - Default: `movies`
- `VITE_MEILISEARCH_SEMANTIC_RATIO` - Default: `0.5` (0.0=keyword, 1.0=vector)
- `VITE_APP_TITLE` - Default: `Hybrid Search`

### 2. Generate Meilisearch Master Key

```bash
# Generate a secure random key
openssl rand -base64 32
```

Copy this key to both `MEILI_MASTER_KEY` and `VITE_MEILISEARCH_API_KEY` in `.env`.

### 3. Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access the Application

- **Frontend**: http://localhost
- **Meilisearch Admin**: http://localhost:7700

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Nginx:80)    │
└────────┬────────┘
         │
         │ HTTP
         │
┌────────▼────────┐
│  Meilisearch    │
│    (:7700)      │
└─────────────────┘
```

## Service Details

### Frontend Service

- **Container**: `hybrid-search-frontend`
- **Base Image**: `nginx:alpine`
- **Port**: 80
- **Build**: Multi-stage (Node.js → Nginx)
- **Health Check**: HTTP GET /

**Features:**
- Optimized production build with Vite
- Gzip compression enabled
- SPA routing support
- Static asset caching (1 year)
- Security headers configured

### Meilisearch Service

- **Container**: `meilisearch`
- **Image**: `getmeili/meilisearch:v1.11`
- **Port**: 7700
- **Data**: Persisted in named volume `meilisearch_data`
- **Health Check**: HTTP GET /health

## Docker Commands

### Managing Services

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service_name]

# Rebuild frontend after code changes
docker-compose build frontend
docker-compose up -d frontend
```

### Data Management

```bash
# Backup Meilisearch data
docker run --rm -v meilisearch-simple-hybrid-search-frontend_meilisearch_data:/data \
  -v $(pwd)/backup:/backup alpine tar czf /backup/meilisearch-backup.tar.gz /data

# Restore Meilisearch data
docker run --rm -v meilisearch-simple-hybrid-search-frontend_meilisearch_data:/data \
  -v $(pwd)/backup:/backup alpine tar xzf /backup/meilisearch-backup.tar.gz -C /

# Remove all data (WARNING: Destructive)
docker-compose down -v
```

### Debugging

```bash
# Enter frontend container
docker exec -it hybrid-search-frontend sh

# Enter Meilisearch container
docker exec -it meilisearch sh

# View container resource usage
docker stats

# Inspect service health
docker inspect hybrid-search-frontend | grep -A 10 Health
```

## Production Deployment

### Security Checklist

- [ ] Set strong `MEILI_MASTER_KEY` (32+ characters)
- [ ] Keep `.env` file out of version control
- [ ] Use HTTPS with reverse proxy (Nginx, Caddy, Traefik)
- [ ] Restrict Meilisearch port (7700) to internal network only
- [ ] Set up firewall rules
- [ ] Enable Docker content trust
- [ ] Regular security updates

### Reverse Proxy Setup (Nginx)

```nginx
# /etc/nginx/sites-available/hybrid-search
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Meilisearch (if public access needed)
    location /meilisearch/ {
        proxy_pass http://localhost:7700/;
        proxy_set_header Host $host;
    }
}
```

### Updating Configuration

When you need to change environment variables:

```bash
# 1. Update .env file
nano .env

# 2. Rebuild frontend (env vars are baked into build)
docker-compose build frontend

# 3. Recreate services
docker-compose up -d
```

## Scaling

### Horizontal Scaling (Multiple Frontend Instances)

```yaml
# docker-compose.yaml
services:
  frontend:
    deploy:
      replicas: 3
    # ... rest of config
```

### Using with Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yaml hybrid-search

# Scale frontend
docker service scale hybrid-search_frontend=5

# Check services
docker stack services hybrid-search
```

## Troubleshooting

### Frontend won't start

```bash
# Check build logs
docker-compose logs frontend

# Common issues:
# - GEMINI_API_KEY not set → Update .env and rebuild
# - Build errors → Check Node.js version in Dockerfile
```

### Meilisearch connection errors

```bash
# Check if Meilisearch is healthy
docker-compose ps meilisearch

# Check logs
docker-compose logs meilisearch

# Test connection
curl http://localhost:7700/health

# Common issues:
# - MEILI_MASTER_KEY mismatch → Ensure VITE_MEILISEARCH_API_KEY matches
# - Network issues → Check docker-compose network configuration
```

### Search returns no results

```bash
# Check if index exists
curl http://localhost:7700/indexes \
  -H "Authorization: Bearer YOUR_MASTER_KEY"

# Create index (if needed)
curl -X POST http://localhost:7700/indexes \
  -H "Authorization: Bearer YOUR_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"uid": "movies", "primaryKey": "id"}'
```

### AI summaries not working

- Verify `GEMINI_API_KEY` is correct
- Check browser console for errors
- Ensure API key has Gemini API access enabled at https://aistudio.google.com/

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ | - | Google Gemini API key |
| `MEILI_MASTER_KEY` | ✅ | - | Meilisearch master key |
| `VITE_MEILISEARCH_HOST` | ❌ | `http://meilisearch:7700` | Meilisearch URL |
| `VITE_MEILISEARCH_API_KEY` | ✅ | - | Meilisearch API key |
| `VITE_MEILISEARCH_INDEX` | ❌ | `movies` | Search index name |
| `VITE_MEILISEARCH_SEMANTIC_RATIO` | ❌ | `0.5` | Hybrid search ratio |
| `VITE_MEILISEARCH_EMBEDDER` | ❌ | `default` | Embedder name |
| `VITE_APP_TITLE` | ❌ | `Hybrid Search` | Application title |
| `VITE_APP_LOGO` | ❌ | - | Logo URL |

## Performance Optimization

### Build Optimization

```dockerfile
# Use specific Node version for consistency
FROM node:20.11-alpine AS builder

# Enable build cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

### Nginx Tuning

```nginx
# Add to nginx.conf for better performance
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
}
```

## Additional Resources

- [Meilisearch Docker Documentation](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Docker Documentation](https://hub.docker.com/_/nginx)
- [Vite Production Build](https://vite.dev/guide/build.html)

## License

Same as parent project.
