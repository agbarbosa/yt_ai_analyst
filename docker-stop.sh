#!/bin/bash

# YouTube AI Analyst - Docker Stop Script
# Gracefully stops all services

set -e

echo "🛑 YouTube AI Analyst - Stopping Docker Services"
echo "================================================="

echo ""
echo "Stopping containers..."
docker-compose down

echo ""
echo "✅ All services stopped successfully!"
echo ""
echo "💡 To remove volumes (delete all data):"
echo "   docker-compose down -v"
echo ""
echo "🔄 To restart services:"
echo "   ./docker-start.sh"
echo ""
