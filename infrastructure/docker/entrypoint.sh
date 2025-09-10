#!/bin/sh

# Enterprise SCTE-35 Encoder Production Entrypoint
set -e

echo "🚀 Starting SCTE-35 Enterprise Encoder..."

# Wait for dependencies
echo "⏳ Waiting for dependencies..."
if [ -n "$DATABASE_URL" ]; then
    echo "📊 Database: $DATABASE_URL"
fi

if [ -n "$REDIS_URL" ]; then
    echo "🔴 Redis: $REDIS_URL"
fi

# Validate required environment variables
if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET is required"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is required"
    exit 1
fi

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Start the application
echo "🎬 Starting SCTE-35 Enterprise Encoder..."
exec node server.js
