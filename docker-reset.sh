#!/bin/bash

# YouTube AI Analyst - Docker Reset Script
# Completely resets the Docker environment (USE WITH CAUTION!)

set -e

echo "⚠️  YouTube AI Analyst - RESET Docker Environment"
echo "================================================="
echo ""
echo "⚠️  WARNING: This will:"
echo "   - Stop all containers"
echo "   - Remove all containers"
echo "   - Remove all volumes (ALL DATA WILL BE LOST!)"
echo "   - Remove all networks"
echo "   - Remove all images"
echo ""
read -p "Are you ABSOLUTELY SURE? (type 'yes' to confirm): " -r
echo

if [ "$REPLY" != "yes" ]; then
    echo "❌ Reset cancelled."
    exit 1
fi

echo ""
echo "🗑️  Stopping and removing all containers..."
docker-compose down -v --remove-orphans

echo ""
echo "🗑️  Removing Docker images..."
docker-compose down --rmi all

echo ""
echo "🗑️  Removing dangling volumes..."
docker volume prune -f

echo ""
echo "✅ Docker environment has been completely reset!"
echo ""
echo "🔄 To start fresh:"
echo "   ./docker-start.sh"
echo ""
