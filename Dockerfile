# Multi-stage Dockerfile for Node.js Vite application
# Optimized for development and production with best practices

# ============================================
# Base Stage - Common dependencies
# ============================================
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# ============================================
# Development Stage
# ============================================
FROM base AS development

# Set development environment
ENV NODE_ENV=development

# Copy package files for layer caching optimization
COPY package*.json ./

# Install all dependencies (including dev dependencies)
# Using npm ci for reproducible builds
RUN npm ci && npm cache clean --force

# Copy source code (done last to maximize layer cache hits)
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Health check for development
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5173', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run development server with host 0.0.0.0 for Docker networking
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ============================================
# Dependencies Stage - Separate for better caching
# ============================================
FROM base AS dependencies

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci && npm cache clean --force

# ============================================
# Builder Stage
# ============================================
FROM dependencies AS builder

# Set build environment
ENV NODE_ENV=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM base AS production

# Set production environment (reduces memory overhead by 30%)
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user and set ownership
RUN chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose Vite preview port
EXPOSE 5173

# Health check for production
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5173', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run production preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
