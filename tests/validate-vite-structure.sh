#!/bin/bash
# TDD RED Phase: Test script to validate Vite + React + TypeScript project structure
# This script MUST FAIL initially, then pass after implementation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔴 RED PHASE: Validating Vite + React + TypeScript project structure..."
echo ""

FAILED=0

# Function to check if file exists
check_file() {
  local file="$1"
  local description="$2"

  if [ -f "$PROJECT_ROOT/$file" ]; then
    echo "✅ $description: $file"
    return 0
  else
    echo "❌ $description: $file NOT FOUND"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# Function to check if directory exists
check_dir() {
  local dir="$1"
  local description="$2"

  if [ -d "$PROJECT_ROOT/$dir" ]; then
    echo "✅ $description: $dir/"
    return 0
  else
    echo "❌ $description: $dir/ NOT FOUND"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# Function to check file contains specific content
check_content() {
  local file="$1"
  local pattern="$2"
  local description="$3"

  if [ ! -f "$PROJECT_ROOT/$file" ]; then
    echo "❌ $description: $file NOT FOUND"
    FAILED=$((FAILED + 1))
    return 1
  fi

  if grep -q "$pattern" "$PROJECT_ROOT/$file"; then
    echo "✅ $description"
    return 0
  else
    echo "❌ $description: Pattern '$pattern' not found in $file"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

echo "Checking core configuration files..."
check_file "package.json" "Package configuration"
check_file "vite.config.ts" "Vite TypeScript config"
check_file "tsconfig.json" "TypeScript config"
check_file "tsconfig.node.json" "TypeScript Node config"
check_file "index.html" "HTML entry point"

echo ""
echo "Checking React source files..."
check_dir "src" "Source directory"
check_file "src/main.tsx" "React entry point"
check_file "src/App.tsx" "Main React component"
check_file "src/vite-env.d.ts" "Vite type definitions"

echo ""
echo "Checking Vite config for Docker HMR settings..."
check_content "vite.config.ts" "usePolling: true" "Vite config has polling enabled for Docker"
check_content "vite.config.ts" "host: '0.0.0.0'" "Vite config has host binding for Docker"
check_content "vite.config.ts" "@vitejs/plugin-react" "Vite config has React plugin"

echo ""
echo "Checking TypeScript strict mode..."
check_content "tsconfig.json" '"strict": true' "TypeScript strict mode enabled"

echo ""
echo "Checking package.json dependencies..."
check_content "package.json" "react" "React dependency present"
check_content "package.json" "react-dom" "React DOM dependency present"
check_content "package.json" "typescript" "TypeScript dependency present"
check_content "package.json" "@vitejs/plugin-react" "Vite React plugin dependency present"

echo ""
echo "========================================="
if [ $FAILED -eq 0 ]; then
  echo "✅ All validation checks passed!"
  echo "========================================="
  exit 0
else
  echo "❌ $FAILED validation check(s) failed"
  echo "========================================="
  exit 1
fi
