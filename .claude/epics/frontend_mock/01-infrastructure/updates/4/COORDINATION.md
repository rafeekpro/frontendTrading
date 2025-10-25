# Stream Coordination Document

## Stream A (Docker Configuration) → Stream B (Docker Compose)

**Status**: Stream A COMPLETED ✅

### Files Created by Stream A
- `/Dockerfile` - Multi-stage build (development, builder, production)
- `/.dockerignore` - Build context optimization
- `/tests/docker-validation.sh` - Validation test suite

### Critical Information for Stream B

#### 1. Container Configuration Requirements

**Target Stage for Development**:
```yaml
services:
  app:
    build:
      context: .
      target: development  # Use this target for local dev
```

**Port Mapping**:
```yaml
ports:
  - "5173:5173"  # Vite dev server
```

**Volume Configuration** (CRITICAL):
```yaml
volumes:
  # Source code - bind mount for hot reload
  - .:/app

  # Node modules - named volume (do NOT bind mount)
  - node_modules:/app/node_modules
```

**Why separate volume for node_modules?**
- Prevents host OS node_modules conflicts
- Faster performance (especially on macOS/Windows)
- Ensures container uses correct architecture binaries

#### 2. Environment Variables

**Already set in Dockerfile**:
- `NODE_ENV=development` (in development stage)
- `NODE_ENV=production` (in production stage)

**May need to add in docker-compose.yml**:
```yaml
environment:
  - VITE_API_URL=${VITE_API_URL:-http://localhost:3000}
  # Add other Vite-specific environment variables as needed
```

#### 3. Vite Configuration Required

**CRITICAL for Hot Reload**: Stream B must ensure Vite config includes:
```javascript
// vite.config.js or vite.config.ts
export default defineConfig({
  server: {
    watch: {
      usePolling: true,  // REQUIRED for Docker
    },
    host: "0.0.0.0",     // Already handled by Dockerfile CMD
    port: 5173,
  },
})
```

**Note**: The Dockerfile already passes `--host 0.0.0.0` to the dev server, but polling must be configured in vite.config.js.

#### 4. Health Check

Already configured in Dockerfile:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5173', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

Can be overridden in docker-compose.yml if needed.

#### 5. Service Dependencies

If backend service is added later:
```yaml
services:
  app:
    depends_on:
      backend:
        condition: service_healthy
```

#### 6. Restart Policy

Recommended for development:
```yaml
services:
  app:
    restart: unless-stopped
```

#### 7. Container Naming

Suggested naming convention:
```yaml
services:
  app:
    container_name: frontendTrading_app_dev
```

#### 8. Networks (if needed)

For service isolation:
```yaml
networks:
  frontend:
    driver: bridge

services:
  app:
    networks:
      - frontend
```

### Testing Stream B Implementation

After docker-compose.yml is created, validate:

1. **Build succeeds**:
   ```bash
   docker compose build
   ```

2. **Container starts**:
   ```bash
   docker compose up -d
   ```

3. **Hot reload works**:
   - Edit a source file
   - Verify browser auto-refreshes
   - Check container logs: `docker compose logs -f app`

4. **Port accessible**:
   ```bash
   curl http://localhost:5173
   # or visit in browser
   ```

5. **Health check passes**:
   ```bash
   docker compose ps
   # Status should show "healthy"
   ```

### Common Issues and Solutions

**Issue**: Hot reload not working
**Solution**: Ensure `usePolling: true` in vite.config.js

**Issue**: Permission errors with node_modules
**Solution**: Use named volume for node_modules, not bind mount

**Issue**: Slow file watching on macOS
**Solution**: Already handled with usePolling configuration

**Issue**: Container exits immediately
**Solution**: Check logs with `docker compose logs app`

### Stream B Deliverables Checklist

- [ ] docker-compose.yml created with correct service configuration
- [ ] Volume mounts configured (source + node_modules)
- [ ] Port mapping 5173:5173
- [ ] Target stage set to "development"
- [ ] Environment variables configured (if needed)
- [ ] vite.config.js/ts includes usePolling
- [ ] Container builds successfully
- [ ] Container starts and stays running
- [ ] Hot reload tested and working
- [ ] Health check passes
- [ ] Documentation updated

### Questions for Stream B Lead?

If you have questions about the Dockerfile implementation or need clarification on any configuration, please check:
1. `/Users/rla/Projects/frontendTrading/.claude/epics/frontend_mock/01-infrastructure/updates/4/stream-A.md`
2. `/Users/rla/Projects/frontendTrading/Dockerfile` (has detailed comments)

### Git References

Stream A commits (in order):
1. `bb7652b` - Failing tests (RED)
2. `3c43021` - Minimal implementation (GREEN)
3. `5878bd4` - Optimizations (REFACTOR)
4. `416b8c1` - Progress documentation

All files ready for Stream B to begin.
