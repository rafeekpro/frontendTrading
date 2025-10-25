#!/bin/bash

# Docker Validation Test Script
# Tests Dockerfile configuration against requirements
# This script MUST fail initially (RED phase) before implementation

set -e

echo "🔴 RED PHASE: Docker Validation Tests"
echo "====================================="

DOCKERFILE="./Dockerfile"
DOCKERIGNORE="./.dockerignore"
FAIL_COUNT=0
PASS_COUNT=0

# Test helper functions
pass_test() {
    echo "✅ PASS: $1"
    PASS_COUNT=$((PASS_COUNT + 1))
}

fail_test() {
    echo "❌ FAIL: $1"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

# Test 1: Dockerfile exists
echo ""
echo "Test 1: Dockerfile exists"
if [ -f "$DOCKERFILE" ]; then
    pass_test "Dockerfile exists"
else
    fail_test "Dockerfile does not exist"
fi

# Test 2: .dockerignore exists
echo ""
echo "Test 2: .dockerignore exists"
if [ -f "$DOCKERIGNORE" ]; then
    pass_test ".dockerignore exists"
else
    fail_test ".dockerignore does not exist"
fi

# Test 3: Dockerfile contains Node 20 Alpine base
echo ""
echo "Test 3: Dockerfile uses Node 20 Alpine base"
if [ -f "$DOCKERFILE" ] && grep -q "FROM node:20-alpine" "$DOCKERFILE"; then
    pass_test "Dockerfile uses Node 20 Alpine"
else
    fail_test "Dockerfile does not use Node 20 Alpine"
fi

# Test 4: Multi-stage build with development stage
echo ""
echo "Test 4: Multi-stage build includes development stage"
if [ -f "$DOCKERFILE" ] && grep -q "AS development" "$DOCKERFILE"; then
    pass_test "Development stage exists"
else
    fail_test "Development stage missing"
fi

# Test 5: Multi-stage build with builder stage
echo ""
echo "Test 5: Multi-stage build includes builder stage"
if [ -f "$DOCKERFILE" ] && grep -q "AS builder" "$DOCKERFILE"; then
    pass_test "Builder stage exists"
else
    fail_test "Builder stage missing"
fi

# Test 6: Multi-stage build with production stage
echo ""
echo "Test 6: Multi-stage build includes production stage"
if [ -f "$DOCKERFILE" ] && grep -q "AS production" "$DOCKERFILE"; then
    pass_test "Production stage exists"
else
    fail_test "Production stage missing"
fi

# Test 7: WORKDIR is set
echo ""
echo "Test 7: WORKDIR is configured"
if [ -f "$DOCKERFILE" ] && grep -q "WORKDIR" "$DOCKERFILE"; then
    pass_test "WORKDIR is set"
else
    fail_test "WORKDIR not set"
fi

# Test 8: Port 5173 exposed for Vite
echo ""
echo "Test 8: Port 5173 exposed for Vite"
if [ -f "$DOCKERFILE" ] && grep -q "EXPOSE 5173" "$DOCKERFILE"; then
    pass_test "Port 5173 exposed"
else
    fail_test "Port 5173 not exposed"
fi

# Test 9: Non-root user configured
echo ""
echo "Test 9: Non-root user configured"
if [ -f "$DOCKERFILE" ] && grep -q "USER node" "$DOCKERFILE"; then
    pass_test "Non-root user configured"
else
    fail_test "Non-root user not configured"
fi

# Test 10: Production dependencies only in final stage
echo ""
echo "Test 10: Production uses --only=production flag"
if [ -f "$DOCKERFILE" ] && grep -q "npm ci --only=production" "$DOCKERFILE"; then
    pass_test "Production dependencies optimized"
else
    fail_test "Production dependencies not optimized"
fi

# Test 11: .dockerignore excludes node_modules
echo ""
echo "Test 11: .dockerignore excludes node_modules"
if [ -f "$DOCKERIGNORE" ] && grep -q "node_modules" "$DOCKERIGNORE"; then
    pass_test ".dockerignore excludes node_modules"
else
    fail_test ".dockerignore does not exclude node_modules"
fi

# Test 12: .dockerignore excludes .git
echo ""
echo "Test 12: .dockerignore excludes .git"
if [ -f "$DOCKERIGNORE" ] && grep -q ".git" "$DOCKERIGNORE"; then
    pass_test ".dockerignore excludes .git"
else
    fail_test ".dockerignore does not exclude .git"
fi

# Test 13: Health check configured
echo ""
echo "Test 13: Health check configured"
if [ -f "$DOCKERFILE" ] && grep -q "HEALTHCHECK" "$DOCKERFILE"; then
    pass_test "Health check configured"
else
    fail_test "Health check not configured"
fi

# Test 14: NODE_ENV set to production in production stage
echo ""
echo "Test 14: NODE_ENV=production in production stage"
if [ -f "$DOCKERFILE" ] && grep -q "NODE_ENV=production" "$DOCKERFILE"; then
    pass_test "NODE_ENV=production set"
else
    fail_test "NODE_ENV=production not set"
fi

# Summary
echo ""
echo "====================================="
echo "Test Results:"
echo "  ✅ Passed: $PASS_COUNT"
echo "  ❌ Failed: $FAIL_COUNT"
echo "  📊 Total:  $((PASS_COUNT + FAIL_COUNT))"
echo "====================================="

if [ $FAIL_COUNT -gt 0 ]; then
    echo ""
    echo "🔴 RED PHASE: Tests failed as expected (no implementation yet)"
    exit 1
else
    echo ""
    echo "✅ GREEN PHASE: All tests passed!"
    exit 0
fi
