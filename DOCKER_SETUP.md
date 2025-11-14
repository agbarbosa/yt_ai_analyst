# 🐳 Docker Setup Guide - YouTube AI Analyst

Complete guide for running the YouTube AI Analyst application using Docker containers.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Services](#services)
- [Configuration](#configuration)
- [Management Scripts](#management-scripts)
- [Common Operations](#common-operations)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## 🎯 Overview

This Docker setup provides a complete, production-ready environment with:

- **Application**: Node.js 20 Alpine with TypeScript
- **PostgreSQL 15**: Structured data storage
- **MongoDB 7**: Analytics and time-series data
- **Redis 7**: Caching and job queue
- **Admin Tools** (optional): pgAdmin, Mongo Express, Redis Commander

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   App    │──│PostgreSQL│  │ MongoDB  │  │ Redis  │ │
│  │  :3000   │  │  :5432   │  │  :27017  │  │ :6379  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│       │                                                  │
│  ┌────┴────────────────────────────────────────────┐   │
│  │  Optional Admin Tools (--profile admin)         │   │
│  │  pgAdmin :5050 | Mongo Express :8081 | Redis :8082│ │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

### Required

- **Docker**: 24.0+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.0+ ([Install Docker Compose](https://docs.docker.com/compose/install/))
- **YouTube API Key**: [Google Cloud Console](https://console.cloud.google.com/)
- **Anthropic API Key**: [Anthropic Console](https://console.anthropic.com/)

### System Requirements

- **RAM**: Minimum 4GB, Recommended 8GB
- **Disk Space**: 5GB free space
- **CPU**: 2+ cores recommended

### Verify Installation

```bash
docker --version          # Should be 24.0+
docker-compose --version  # Should be 2.0+
```

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/agbarbosa/yt_ai_analyst.git
cd yt_ai_analyst
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.docker .env

# Edit with your API keys
nano .env  # or vim, code, etc.
```

**Required Configuration:**
```env
# YouTube API (Required)
YOUTUBE_API_KEY=your_api_key_here

# Anthropic Claude (Required)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Security (Change all passwords!)
POSTGRES_PASSWORD=YourSecurePassword123!
REDIS_PASSWORD=YourSecurePassword123!
JWT_SECRET=your-jwt-secret-minimum-32-characters-long
```

### 3. Start Services

```bash
# Option A: Using start script (recommended)
./docker-start.sh

# Option B: Using docker-compose directly
docker-compose up -d
```

### 4. Verify Services

```bash
# Check all containers are running
docker-compose ps

# Test application health
curl http://localhost:3000/health

# View logs
docker-compose logs -f app
```

### 5. Test API

```bash
# Analyze a YouTube video
curl http://localhost:3000/api/videos/dQw4w9WgXcQ/analysis

# Search for channels
curl "http://localhost:3000/api/search/channels?q=coding&maxResults=5"
```

---

## 🛠️ Services

### Core Services (Always Running)

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| **app** | 3000 | YouTube AI Analyst API | `GET /health` |
| **postgres** | 5432 | PostgreSQL database | `pg_isready` |
| **mongodb** | 27017 | MongoDB analytics | `mongosh ping` |
| **redis** | 6379 | Cache & job queue | `redis-cli ping` |

### Admin Tools (Optional - `--profile admin`)

| Service | Port | Description | Login |
|---------|------|-------------|-------|
| **pgadmin** | 5050 | PostgreSQL management | See `.env` |
| **mongo-express** | 8081 | MongoDB management | See `.env` |
| **redis-commander** | 8082 | Redis management | No login |

To start with admin tools:
```bash
docker-compose --profile admin up -d
```

---

## ⚙️ Configuration

### Environment Variables

Complete list in `.env.docker`. Key sections:

#### Application Settings
```env
NODE_ENV=production          # production | development
PORT=3000                   # Application port
LOG_LEVEL=info              # error | warn | info | debug
```

#### Database Configuration
```env
# PostgreSQL
POSTGRES_DB=yt_ai_analyst
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me

# MongoDB
MONGODB_DB=yt_ai_analyst

# Redis
REDIS_PASSWORD=change_me
```

#### AI Configuration
```env
AI_PRIMARY_MODEL=claude-sonnet-4.5
AI_TEMPERATURE_ANALYTICAL=0.3
AI_TEMPERATURE_CREATIVE=0.6
AI_MAX_TOKENS=4000
```

#### Feature Flags
```env
ENABLE_SHORTS_ANALYSIS=true
ENABLE_COMPETITOR_ANALYSIS=false
ENABLE_REALTIME_UPDATES=true
```

### Volume Persistence

Data is persisted in Docker volumes:

```bash
# List volumes
docker volume ls | grep yt_analyst

# Volumes created:
# - yt_ai_analyst_postgres_data  (PostgreSQL)
# - yt_ai_analyst_mongodb_data   (MongoDB)
# - yt_ai_analyst_redis_data     (Redis)
# - yt_ai_analyst_pgadmin_data   (pgAdmin)
```

---

## 📜 Management Scripts

### docker-start.sh

Start all services with health checks.

```bash
./docker-start.sh
```

**Features:**
- ✅ Checks for `.env` file
- ✅ Creates logs directory
- ✅ Builds Docker images
- ✅ Starts all services
- ✅ Waits for health checks
- ✅ Displays service URLs

### docker-stop.sh

Gracefully stop all services.

```bash
./docker-stop.sh
```

### docker-logs.sh

View container logs.

```bash
# All services
./docker-logs.sh

# Specific service
./docker-logs.sh app
./docker-logs.sh postgres
./docker-logs.sh mongodb
./docker-logs.sh redis
```

### docker-reset.sh

⚠️ **WARNING**: Completely resets environment (deletes all data!)

```bash
./docker-reset.sh
```

**This will:**
- Stop all containers
- Remove all volumes (DATA LOSS!)
- Remove all images
- Clean up networks

---

## 🔧 Common Operations

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart app

# Start with admin tools
docker-compose --profile admin up -d
```

### View Logs

```bash
# All services (follow mode)
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 app

# Since timestamp
docker-compose logs --since 2023-01-01T10:00:00 app
```

### Execute Commands in Containers

```bash
# App container
docker-compose exec app sh
docker-compose exec app node -e "console.log('Hello')"

# PostgreSQL
docker-compose exec postgres psql -U postgres -d yt_ai_analyst

# MongoDB
docker-compose exec mongodb mongosh yt_ai_analyst

# Redis
docker-compose exec redis redis-cli
```

### Database Operations

#### PostgreSQL

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d yt_ai_analyst

# Run SQL file
docker-compose exec -T postgres psql -U postgres -d yt_ai_analyst < backup.sql

# Backup database
docker-compose exec -T postgres pg_dump -U postgres yt_ai_analyst > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d yt_ai_analyst < backup.sql
```

#### MongoDB

```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh yt_ai_analyst

# Backup
docker-compose exec -T mongodb mongodump --archive > mongodb_backup.archive

# Restore
docker-compose exec -T mongodb mongorestore --archive < mongodb_backup.archive
```

### Rebuild Application

```bash
# Rebuild and restart app
docker-compose build app
docker-compose up -d app

# Force rebuild (no cache)
docker-compose build --no-cache app
```

### Scale Services

```bash
# Note: Only stateless services can be scaled
# (not recommended for this setup due to shared state)
docker-compose up -d --scale app=3
```

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis
docker-compose exec redis redis-cli ping
```

---

## 🐛 Troubleshooting

### Services Won't Start

**Problem**: Containers exit immediately

```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Missing environment variables
# 2. Port conflicts
# 3. Permission issues
```

**Solutions**:

```bash
# Check .env file exists and is configured
cat .env

# Check port availability
netstat -an | grep 3000
netstat -an | grep 5432

# Stop conflicting services
sudo systemctl stop postgresql  # If local postgres is running
```

### Database Connection Errors

**Problem**: App can't connect to PostgreSQL/MongoDB

```bash
# Check database is running
docker-compose ps postgres

# Check connection from app
docker-compose exec app ping postgres
docker-compose exec app ping mongodb

# View database logs
docker-compose logs postgres
docker-compose logs mongodb
```

**Solutions**:

```bash
# Restart database
docker-compose restart postgres

# Recreate network
docker-compose down
docker-compose up -d
```

### Out of Memory Errors

**Problem**: Containers crashing with OOM

```bash
# Check Docker memory limits
docker stats

# Increase Docker memory (Docker Desktop)
# Settings → Resources → Memory → 8GB
```

### Permission Denied

**Problem**: Cannot write to volumes

```bash
# Check volume permissions
docker-compose exec app ls -la /app/logs

# Fix permissions
docker-compose exec -u root app chown -R nodejs:nodejs /app/logs
```

### API Key Errors

**Problem**: YouTube/Anthropic API errors

```bash
# Verify keys are set
docker-compose exec app printenv | grep API_KEY

# Check API quotas
# - YouTube: https://console.cloud.google.com/apis/dashboard
# - Anthropic: https://console.anthropic.com/
```

### Port Already in Use

**Problem**: "Port is already allocated"

```bash
# Find process using port
lsof -i :3000
sudo netstat -tulpn | grep :3000

# Kill process or change port in .env
```

### Environment Variable Warnings

**Problem**: "The YOUTUBE_CLIENT_ID variable is not set. Defaulting to a blank string."

**Solution**:

```bash
# Ensure .env file exists
ls -la .env

# If missing, copy from template
cp .env.docker .env

# Edit with your actual API keys
nano .env  # Update YOUTUBE_API_KEY, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, ANTHROPIC_API_KEY
```

**Critical**: The application REQUIRES these API keys to function:
- `YOUTUBE_API_KEY` - Get from https://console.cloud.google.com/
- `YOUTUBE_CLIENT_ID` - OAuth client ID from Google Cloud Console
- `YOUTUBE_CLIENT_SECRET` - OAuth client secret
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/

### Cannot Connect to Docker Daemon

**Problem**: "Cannot connect to Docker daemon" or "open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified"

**Solution**:

```bash
# Windows (WSL2): Ensure Docker Desktop is running
# 1. Open Docker Desktop application on Windows
# 2. Wait for it to fully start (green icon in system tray)
# 3. In WSL2, verify connection:
docker info

# Linux: Start Docker service
sudo systemctl start docker

# Mac: Open Docker Desktop application

# Verify Docker is running
docker info
docker ps
```

---

## 🚢 Production Deployment

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS with reverse proxy
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Enable log rotation
- [ ] Backup strategy in place
- [ ] Review exposed ports

### Recommended Setup

```bash
# Use production compose file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Enable log rotation
docker-compose config | grep logging
```

### Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name ytanalyst.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Environment-Specific Configs

```bash
# Development
docker-compose --env-file .env.dev up -d

# Staging
docker-compose --env-file .env.staging up -d

# Production
docker-compose --env-file .env.prod up -d
```

### Monitoring

```bash
# Container stats
docker stats

# Health check monitoring
watch -n 5 'curl -s http://localhost:3000/health | jq'

# Log aggregation
docker-compose logs -f | grep ERROR
```

### Backup Strategy

```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres yt_ai_analyst > "backup_${DATE}.sql"
docker-compose exec -T mongodb mongodump --archive > "backup_mongo_${DATE}.archive"
```

---

## 📊 Performance Tuning

### PostgreSQL Optimization

```bash
# Increase shared buffers
# Add to docker-compose.yml under postgres:
command:
  - "postgres"
  - "-c"
  - "shared_buffers=256MB"
  - "-c"
  - "max_connections=200"
```

### Redis Configuration

```bash
# Adjust maxmemory
# Add to docker-compose.yml under redis:
command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Application Scaling

```bash
# Use load balancer with multiple app instances
# Nginx upstream configuration:
upstream app_backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}
```

---

## 🔗 Useful Commands

```bash
# Quick reference
docker-compose ps                    # List containers
docker-compose down -v               # Remove volumes
docker system prune -a               # Clean everything
docker volume ls                     # List volumes
docker network ls                    # List networks
docker-compose config                # Validate config
docker-compose pull                  # Update images
docker-compose build --pull          # Rebuild with latest base
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Redis Docker Hub](https://hub.docker.com/_/redis)

---

## 💡 Tips & Best Practices

1. **Development vs Production**
   - Use `.env.dev` for development
   - Use `.env.prod` for production
   - Never commit `.env` files

2. **Resource Management**
   - Monitor container memory usage
   - Set resource limits in production
   - Use health checks

3. **Data Persistence**
   - Always backup before upgrading
   - Use named volumes for persistence
   - Regular backup schedule

4. **Security**
   - Rotate passwords regularly
   - Use secrets management
   - Keep images updated

5. **Debugging**
   - Check logs first
   - Use `docker-compose exec` for shell access
   - Monitor health endpoints

---

**Need Help?** Check the main [README.md](README.md) or [create an issue](https://github.com/agbarbosa/yt_ai_analyst/issues)
