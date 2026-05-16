# ============================================================
# SIGG GMAO Platform - Multi-stage Dockerfile
# Societe Interprofessionnelle du Gaz de Guinee
# ============================================================
# Build:   docker build -t sigg-gmao:latest .
# Run:     docker run -p 3000:3000 --env-file .env sigg-gmao:latest
# ============================================================

# ----------------------------------------------------------
# Stage 1: Dependencies Installation
# ----------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lock files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production=false

# ----------------------------------------------------------
# Stage 2: Build Application
# ----------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js application in standalone mode
RUN npm run build

# ----------------------------------------------------------
# Stage 3: Production Image (Standalone)
# ----------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server and static files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client for migrations at runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy the entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api || exit 1

# Switch to non-root user
USER nextjs

# Start with entrypoint (runs migrations then starts server)
ENTRYPOINT ["/app/docker-entrypoint.sh"]
