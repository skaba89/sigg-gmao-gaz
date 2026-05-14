# ============================================================
# SIGG GMAO Enterprise Suite - Multi-stage Dockerfile
# Societe Interprofessionnelle du Gaz de Guinee
# ============================================================
# Build:   docker build -f download/Dockerfile -t sigg-gmao:latest .
# Run:     docker run -p 3000:3000 --env-file .env sigg-gmao:latest
# ============================================================

# ----------------------------------------------------------
# Stage 1: Dependencies Installation
# ----------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les fichiers de dependances
COPY package.json bun.lock* package-lock.json* yarn.lock* ./

# Installer les dependances avec npm (compatible avec la plupart des environnements)
# Si bun est disponible, utiliser : RUN npm install -g bun && bun install --frozen-lockfile
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f bun.lock ]; then \
    npm install -g bun && bun install --frozen-lockfile; \
  else npm ci; \
  fi

# ----------------------------------------------------------
# Stage 2: Build Application
# ----------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les dependances installees
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generer le client Prisma
RUN npx prisma generate

# Construire l'application Next.js en mode standalone
# Le mode standalone genere un serveur optimise sans modules inutiles
RUN npm run build

# ----------------------------------------------------------
# Stage 3: Production Image (Standalone)
# ----------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Variables d'environnement de production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Creer un utilisateur non-root pour la securite
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier les fichiers necessaires depuis le build standalone
COPY --from=builder /app/public ./public

# Copier le serveur standalone et les fichiers statiques
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copier le schema Prisma pour les migrations au demarrage
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Creer le repertoire de donnees
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Utiliser le port 3000
EXPOSE 3000

# Sante check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD curl -f http://localhost:3000/api || exit 1

# Basculer vers l'utilisateur non-root
USER nextjs

# Commande de demarrage
CMD ["node", "server.js"]
