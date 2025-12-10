# Multi-stage build for production deployment

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables (injected at build time by Vite)
ARG GEMINI_API_KEY
ARG VITE_MEILISEARCH_HOST=http://meilisearch:7700
ARG VITE_MEILISEARCH_API_KEY
ARG VITE_MEILISEARCH_INDEX=movies
ARG VITE_MEILISEARCH_SEMANTIC_RATIO=0.5
ARG VITE_MEILISEARCH_EMBEDDER=default
ARG VITE_APP_TITLE=Hybrid Search
ARG VITE_APP_LOGO

# Set environment variables for build
ENV GEMINI_API_KEY=${GEMINI_API_KEY}
ENV VITE_MEILISEARCH_HOST=${VITE_MEILISEARCH_HOST}
ENV VITE_MEILISEARCH_API_KEY=${VITE_MEILISEARCH_API_KEY}
ENV VITE_MEILISEARCH_INDEX=${VITE_MEILISEARCH_INDEX}
ENV VITE_MEILISEARCH_SEMANTIC_RATIO=${VITE_MEILISEARCH_SEMANTIC_RATIO}
ENV VITE_MEILISEARCH_EMBEDDER=${VITE_MEILISEARCH_EMBEDDER}
ENV VITE_APP_TITLE=${VITE_APP_TITLE}
ENV VITE_APP_LOGO=${VITE_APP_LOGO}

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
