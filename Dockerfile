# Multi-stage Docker build for React + TypeScript + Vite application
# Using Node.js Alpine for minimal size and security

# ========================================
# BUILD STAGE
# ========================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies required for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files for dependency installation
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies with npm ci for reliable builds
# Use npm ci instead of npm install for production builds
RUN npm ci --only=production=false --silent

# Copy source code and configuration files
COPY . .

# Build the application
# This creates the dist/ directory with static files
RUN npm run build

# ========================================
# PRODUCTION STAGE
# ========================================
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Install minimal dependencies needed for serving
RUN apk add --no-cache \
    tini \
    && rm -rf /var/cache/apk/*

# Install global serve package for serving static files
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port configured in vite.config.ts
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Use tini as PID 1 to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application using serve for production serving
CMD ["serve", "-s", "dist", "-l", "8080"]