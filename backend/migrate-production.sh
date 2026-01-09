#!/bin/bash
# Database Migration Script for Production
# This script migrates the database to the production DCDeploy PostgreSQL instance

set -e

echo "🚀 Starting database migration to production..."

# Production database URL
export DATABASE_URL="postgresql://vtjFBU:AmYkzn-d79@database-lg6o89g7r9.tcp-proxy-2212.dcdeploy.cloud:30395/database-db"

echo "📊 Database URL configured"
echo "🔍 Verifying connection..."

# Test connection
npx prisma db pull --schema=./prisma/schema.prisma 2>/dev/null && echo "✅ Connection successful" || echo "⚠️  Connection test failed, but continuing..."

echo "📦 Applying migrations..."
npx prisma migrate deploy

echo "✅ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to DCDeploy"
echo "2. Set environment variables"
echo "3. Verify health endpoint"
echo "4. Deploy frontend"
echo "5. Update CORS in backend"
