# Docker Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Vite/Node.js Version Mismatch

**Error:**
```
You are using Node.js 18.x. Vite requires Node.js version 20.19+ or 22.12+
TypeError: crypto.hash is not a function
```

**Solution:**
✅ Updated both Dockerfiles to use `node:20-alpine` instead of `node:18-alpine`

### Issue 2: Database Connection Failures

**Error:**
```
Circuit breaker UserRepository.findByEmail failure: Failed query
```

**Solution:**
✅ Added `docker-entrypoint.sh` script that:
- Waits for PostgreSQL to be fully ready
- Runs database migrations automatically
- Then starts the application

### Issue 3: Port Already in Use

**Error:**
```
Error: bind: address already in use
```

**Solution:**
Stop existing services:
```bash
docker-compose down
# Or if that doesn't work:
docker-compose down -v  # This removes volumes too
# Or kill specific ports:
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5432 | xargs kill -9  # Database
```

### Issue 4: Changes Not Reflected

**Error:**
Code changes don't appear in running containers

**Solution:**
Rebuild containers:
```bash
docker-compose down
docker-compose up --build
```

### Issue 5: Permission Errors on Linux

**Error:**
```
Permission denied: /app/node_modules
```

**Solution:**
Fix volume permissions:
```bash
docker-compose down
sudo chown -R $USER:$USER ./backend ./frontend
docker-compose up --build
```

### Issue 6: Database Data Persists

**Scenario:**
Want to start fresh with clean database

**Solution:**
Remove volumes:
```bash
docker-compose down -v  # Removes all volumes
docker-compose up       # Starts fresh
```

## Best Practices

### 1. Clean Rebuild
When updating dependencies or Dockerfiles:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### 2. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### 3. Access Container Shell
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec database psql -U modelia -d modelia_dev
```

### 4. Check Service Status
```bash
docker-compose ps
```

### 5. Restart Single Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

## File Structure Changes

### New Files Added
- ✅ `docker-compose.yml` - Orchestrates all services
- ✅ `backend/Dockerfile` - Backend container configuration
- ✅ `backend/.dockerignore` - Optimize backend image
- ✅ `backend/docker-entrypoint.sh` - Startup script with DB migration
- ✅ `frontend/Dockerfile` - Frontend container configuration
- ✅ `frontend/.dockerignore` - Optimize frontend image

### Key Configuration Points

#### docker-compose.yml
- Database health check ensures PostgreSQL is ready
- Backend waits for healthy database
- Frontend waits for backend
- Volumes for code hot-reload and data persistence
- Network isolation for services

#### backend/docker-entrypoint.sh
- Waits for database connection
- Runs `npm run db:push` automatically
- Starts dev server

## Quick Commands Reference

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# Remove volumes (fresh start)
docker-compose down -v

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Access backend shell
docker-compose exec backend sh

# Run backend commands
docker-compose exec backend npm run db:studio

# Access database
docker-compose exec database psql -U modelia -d modelia_dev
```

## Environment Variables

All environment variables are pre-configured in `docker-compose.yml`:

### Database
- `POSTGRES_USER=modelia`
- `POSTGRES_PASSWORD=modelia_password`
- `POSTGRES_DB=modelia_dev`

### Backend
- `DB_HOST=database` (uses service name)
- Port, JWT, file upload settings all configured

### Frontend
- `VITE_API_URL=http://localhost:3001/v1`

## Debugging Tips

1. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

2. **Inspect logs for errors:**
   ```bash
   docker-compose logs backend | grep -i error
   docker-compose logs frontend | grep -i error
   ```

3. **Test database connection:**
   ```bash
   docker-compose exec backend npm run db:studio
   ```

4. **Verify frontend can reach backend:**
   ```bash
   curl http://localhost:3001/health
   ```

5. **Check container resource usage:**
   ```bash
   docker stats
   ```

## Production Notes

This Docker setup is optimized for **development**:
- Hot reload enabled
- Source code mounted as volumes
- Dev dependencies installed

For **production**, you'll need:
- Multi-stage builds
- Production-optimized images
- Environment-specific configs
- Health checks and restart policies
- Secrets management
- Reverse proxy (nginx)
