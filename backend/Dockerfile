# Multi-stage build for Home Office Backend
# Based on DCDeploy deployment best practices

# Stage 1: Production
FROM node:18-alpine AS production

WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache \
    openssl \
    postgresql-client \
    curl

# Copy package files
COPY package.json package-lock.json* ./

# Install production dependencies
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client (requires OpenSSL)
RUN npx prisma generate

# Copy application source
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start application
CMD ["node", "server.js"]
