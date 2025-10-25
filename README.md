# Frontend Trading - Docker Development Environment

A Docker-first development environment for frontend trading application with hot reload capabilities.

## Prerequisites

- **Docker Desktop 20.10+** (includes Docker Compose V2)
  - [Install Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - [Install Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - [Install Docker Desktop for Linux](https://docs.docker.com/desktop/install/linux-install/)

**No local Node.js installation required** - all development happens inside Docker containers.

## Quick Start

### 1. Start Development Environment

```bash
# Build and start the application
docker compose up -d

# View logs
docker compose logs -f app
```

The application will be available at: [http://localhost:5173](http://localhost:5173)

### 2. Stop Development Environment

```bash
# Stop containers
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

## Development Workflow

### Running Commands

**All commands must be executed inside Docker containers:**

```bash
# Install dependencies
docker compose exec app npm install <package-name>

# Run tests
docker compose exec app npm test

# Run linter
docker compose exec app npm run lint

# Build for production
docker compose exec app npm run build
```

### Hot Reload

Hot reload is **automatically enabled** via:
- Volume mount: Source code is mounted from host to container
- Vite polling: `usePolling: true` in `vite.config.js` (required for Docker)

**To test hot reload:**
1. Edit any source file
2. Save the file
3. Browser should automatically refresh

### Debugging

The development container has `stdin_open: true` and `tty: true` enabled for interactive debugging:

```bash
# Attach to running container for debugging
docker compose exec app sh

# View container logs
docker compose logs -f app

# Inspect container configuration
docker compose config
```

## Architecture

### Multi-Stage Dockerfile

The `Dockerfile` uses a multi-stage build with three stages:

1. **Development** (`target: development`)
   - Node 20 Alpine with all dev dependencies
   - Hot reload enabled
   - Used by `docker-compose.yml`

2. **Builder** (`target: builder`)
   - Optimized build stage
   - Production dependencies only
   - Compiles assets

3. **Production** (`target: production`)
   - Minimal runtime image
   - Serves static files
   - Non-root user for security

### Volume Strategy

```yaml
volumes:
  - .:/app                           # Source code (bind mount)
  - node_modules:/app/node_modules  # Dependencies (named volume)
```

**Why separate volume for node_modules?**
- Prevents host OS conflicts
- Faster performance (especially on macOS/Windows)
- Ensures correct architecture binaries

### Network Configuration

Custom bridge network for service isolation:
- Network name: `frontendTrading_network`
- Allows future backend service integration
- Isolated from other Docker projects

## Environment Variables

Environment variables can be configured via `.env` file:

```bash
# .env file (create in project root)
VITE_API_URL=http://localhost:3000
NODE_ENV=development
```

Default values are set in `docker-compose.yml`.

## Health Checks

The container includes a health check that verifies the Vite dev server is responding:

```bash
# Check container health status
docker compose ps

# Should show "healthy" status after ~10 seconds
```

## Troubleshooting

### Container exits immediately

**Check logs:**
```bash
docker compose logs app
```

**Common causes:**
- Syntax error in code
- Missing dependencies
- Port already in use

### Hot reload not working

**Solution:**
1. Ensure `usePolling: true` is in `vite.config.js`
2. Restart containers: `docker compose restart`
3. Check file permissions on host

### Permission errors with node_modules

**Solution:**
Use named volume for node_modules (already configured). Never bind mount node_modules directly.

### Slow file watching on macOS/Windows

**Solution:**
Already handled with `usePolling: true` in Vite configuration. This is a trade-off for Docker compatibility.

### Port 5173 already in use

**Solution:**
```bash
# Find process using port
lsof -i :5173

# Change port in docker-compose.yml
ports:
  - "3000:5173"  # Host:Container
```

### Build fails with cache issues

**Solution:**
```bash
# Clean build without cache
docker compose build --no-cache

# Remove all images and rebuild
docker compose down --rmi all
docker compose up --build
```

### Container running but can't access localhost:5173

**Check:**
1. Container is healthy: `docker compose ps`
2. Port mapping is correct: `docker compose config | grep ports`
3. Firewall/antivirus blocking port

## Production Build

To test production build locally:

```bash
# Build production image
docker build --target production -t frontendtrading:prod .

# Run production container
docker run -p 5173:5173 frontendtrading:prod

# Or use docker-compose with override
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Validation

Run automated validation tests:

```bash
# Validate docker-compose.yml configuration
./tests/docker-compose-validation.sh

# Validate Dockerfile
./tests/docker-validation.sh
```

## Performance Tips

1. **Use BuildKit** (enabled by default in Docker Desktop)
   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Optimize .dockerignore**
   - Already configured to exclude common files
   - Add project-specific exclusions as needed

3. **Layer caching**
   - `package.json` copied before source code
   - Maximizes cache hits on code changes

4. **Named volumes**
   - node_modules uses named volume for speed
   - Avoids cross-platform binary issues

## Docker Compose Commands Reference

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Rebuild services
docker compose up --build

# View logs
docker compose logs -f [service]

# Execute commands in container
docker compose exec app <command>

# List running containers
docker compose ps

# Inspect configuration
docker compose config

# Remove volumes
docker compose down -v

# Restart service
docker compose restart app
```

## CI/CD Integration

For CI/CD pipelines, use the production build:

```bash
# Build production image
docker build --target production -t registry/app:tag .

# Push to registry
docker push registry/app:tag
```

## Support

For issues related to:
- Docker setup: Check [Docker documentation](https://docs.docker.com/)
- Vite configuration: Check [Vite documentation](https://vitejs.dev/)
- Hot reload issues: See troubleshooting section above

## License

ISC
