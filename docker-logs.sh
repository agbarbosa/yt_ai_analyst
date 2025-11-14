#!/bin/bash

# YouTube AI Analyst - Docker Logs Viewer
# View logs from Docker containers

SERVICE=${1:-all}

echo "📋 YouTube AI Analyst - Viewing Logs"
echo "===================================="
echo ""

if [ "$SERVICE" = "all" ]; then
    echo "Showing logs for all services (Ctrl+C to exit)..."
    echo ""
    docker-compose logs -f
else
    echo "Showing logs for: $SERVICE (Ctrl+C to exit)..."
    echo ""
    docker-compose logs -f "$SERVICE"
fi
