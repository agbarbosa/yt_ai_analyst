#!/bin/bash

# YouTube AI Analyst - Docker Start Script
# Starts all services with proper health checks

set -e

echo "🎬 YouTube AI Analyst - Starting Docker Services"
echo "================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.docker template..."
    cp .env.docker .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your API keys before continuing!"
    echo ""
    echo "Required keys:"
    echo "  - YOUTUBE_API_KEY"
    echo "  - ANTHROPIC_API_KEY"
    echo "  - Database passwords (security)"
    echo ""
    read -p "Have you configured .env? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Exiting. Please configure .env and run again."
        exit 1
    fi
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo ""
echo "🏗️  Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Wait for PostgreSQL
echo -n "   PostgreSQL: "
timeout=60
counter=0
until docker-compose exec -T postgres pg_isready -q 2>/dev/null || [ $counter -eq $timeout ]; do
    sleep 1
    counter=$((counter + 1))
    echo -n "."
done
if [ $counter -eq $timeout ]; then
    echo " ❌ Timeout"
else
    echo " ✅ Ready"
fi

# Wait for MongoDB
echo -n "   MongoDB: "
counter=0
until docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet 2>/dev/null || [ $counter -eq $timeout ]; do
    sleep 1
    counter=$((counter + 1))
    echo -n "."
done
if [ $counter -eq $timeout ]; then
    echo " ❌ Timeout"
else
    echo " ✅ Ready"
fi

# Wait for Redis
echo -n "   Redis: "
counter=0
until docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG || [ $counter -eq $timeout ]; do
    sleep 1
    counter=$((counter + 1))
    echo -n "."
done
if [ $counter -eq $timeout ]; then
    echo " ❌ Timeout"
else
    echo " ✅ Ready"
fi

# Wait for Application
echo -n "   Application: "
counter=0
until curl -sf http://localhost:3000/health >/dev/null 2>&1 || [ $counter -eq $timeout ]; do
    sleep 1
    counter=$((counter + 1))
    echo -n "."
done
if [ $counter -eq $timeout ]; then
    echo " ❌ Timeout"
else
    echo " ✅ Ready"
fi

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📡 Service URLs:"
echo "   Application:  http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
echo "   API Docs:     http://localhost:3000/api"
echo ""
echo "🔧 Management Tools (start with --profile admin):"
echo "   pgAdmin:       http://localhost:5050"
echo "   Mongo Express: http://localhost:8081"
echo "   Redis Cmdr:    http://localhost:8082"
echo ""
echo "📊 View logs:"
echo "   All:         docker-compose logs -f"
echo "   Application: docker-compose logs -f app"
echo "   Database:    docker-compose logs -f postgres"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
