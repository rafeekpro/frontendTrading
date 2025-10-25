#!/bin/bash

# Docker Compose Validation Test Script
# Tests that docker-compose.yml meets all requirements from COORDINATION.md
# Part of TDD RED phase - this should FAIL until docker-compose.yml is created

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TESTS_PASSED=0
TESTS_FAILED=0

echo "========================================"
echo "Docker Compose Validation Tests"
echo "========================================"
echo ""

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo -n "Testing: $test_name... "

    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test 1: docker-compose.yml exists
run_test "docker-compose.yml exists" \
    "test -f docker-compose.yml"

# Test 2: docker-compose.yml is valid YAML
run_test "docker-compose.yml is valid YAML" \
    "docker compose config > /dev/null"

# Test 3: Contains 'app' service
run_test "Contains 'app' service" \
    "docker compose config | grep -q 'app:'"

# Test 4: Uses 'development' target
run_test "Uses 'development' build target" \
    "docker compose config | grep -A 5 'build:' | grep -q 'target: development'"

# Test 5: Port mapping 5173:5173
run_test "Port mapping 5173:5173 configured" \
    "docker compose config | grep -A 3 'ports:' | grep -E 'target: 5173|published.*5173' | wc -l | grep -q '2'"

# Test 6: Source code bind mount
run_test "Source code bind mount (.:/app)" \
    "docker compose config | grep -A 5 'volumes:' | grep 'type: bind' -A 2 | grep -q 'target: /app'"

# Test 7: Node modules named volume
run_test "Node modules named volume configured" \
    "docker compose config | grep -A 3 'type: volume' | grep -q 'target: /app/node_modules'"

# Test 8: Named volume declared
run_test "Named volume 'node_modules' declared" \
    "docker compose config | grep -A 3 '^volumes:' | grep -q 'node_modules:'"

# Test 9: Container naming
run_test "Container name configured" \
    "docker compose config | grep -q 'container_name:'"

# Test 10: Restart policy
run_test "Restart policy configured" \
    "docker compose config | grep -q 'restart:'"

# Test 11: Build context is current directory
run_test "Build context is current directory" \
    "docker compose config | grep -A 3 'build:' | grep -q 'context: .'"

# Additional validation: Check if compose file format is v3+
run_test "Compose file format version" \
    "docker compose config | grep -q 'version:' || docker compose config | grep -q 'services:'"

echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All docker-compose.yml validation tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some docker-compose.yml validation tests failed.${NC}"
    echo ""
    echo "To debug, run:"
    echo "  docker compose config"
    echo ""
    exit 1
fi
