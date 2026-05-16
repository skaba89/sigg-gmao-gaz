#!/bin/sh
# ============================================================
# SIGG GMAO - Docker Entrypoint Script
# Runs Prisma migrations then starts the Next.js server
# ============================================================

set -e

echo "============================================"
echo "  SIGG GMAO - Starting Application"
echo "============================================"
echo ""

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until npx prisma db push --skip-generate 2>/dev/null; do
  echo "  PostgreSQL is not ready yet. Retrying in 3s..."
  sleep 3
done

echo "✅ PostgreSQL is ready!"

# Run Prisma migrations
echo ""
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy
echo "✅ Migrations applied!"

# Cleanup expired blacklisted tokens
echo ""
echo "🧹 Database is up to date."

echo ""
echo "🚀 Starting SIGG GMAO server on port ${PORT:-3000}..."
echo "============================================"
echo ""

# Start the Next.js standalone server
exec node server.js
