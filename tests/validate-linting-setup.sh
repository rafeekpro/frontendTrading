#!/bin/bash
# Validation test for ESLint and Prettier configuration
# This test MUST FAIL initially (RED phase) before implementation

set -e

echo "==================================="
echo "Linting Configuration Validation"
echo "==================================="
echo ""

FAILED=0
PASSED=0

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1 exists"
        ((PASSED++))
    else
        echo "❌ $1 missing"
        ((FAILED++))
    fi
}

check_package_dependency() {
    if grep -q "\"$1\"" package.json; then
        echo "✅ $1 in package.json"
        ((PASSED++))
    else
        echo "❌ $1 missing from package.json"
        ((FAILED++))
    fi
}

check_package_script() {
    if grep -q "\"$1\":" package.json; then
        echo "✅ package.json has $1 script"
        ((PASSED++))
    else
        echo "❌ package.json missing $1 script"
        ((FAILED++))
    fi
}

check_eslint_config() {
    if [ -f ".eslintrc.cjs" ]; then
        if grep -q "typescript-eslint" .eslintrc.cjs; then
            echo "✅ .eslintrc.cjs has TypeScript parser"
            ((PASSED++))
        else
            echo "❌ .eslintrc.cjs missing TypeScript parser"
            ((FAILED++))
        fi

        if grep -q "plugin:react" .eslintrc.cjs; then
            echo "✅ .eslintrc.cjs has React plugin"
            ((PASSED++))
        else
            echo "❌ .eslintrc.cjs missing React plugin"
            ((FAILED++))
        fi
    fi
}

check_prettier_config() {
    if [ -f ".prettierrc" ]; then
        if grep -q "singleQuote" .prettierrc || grep -q "semi" .prettierrc; then
            echo "✅ .prettierrc has formatting rules"
            ((PASSED++))
        else
            echo "❌ .prettierrc missing formatting rules"
            ((FAILED++))
        fi
    fi
}

echo "📦 Checking configuration files..."
check_file ".eslintrc.cjs"
check_file ".prettierrc"

echo ""
echo "📚 Checking package.json dependencies..."
check_package_dependency "eslint"
check_package_dependency "@typescript-eslint/parser"
check_package_dependency "@typescript-eslint/eslint-plugin"
check_package_dependency "eslint-plugin-react"
check_package_dependency "eslint-plugin-react-hooks"
check_package_dependency "eslint-plugin-react-refresh"
check_package_dependency "prettier"
check_package_dependency "eslint-config-prettier"

echo ""
echo "📜 Checking package.json scripts..."
check_package_script "lint"
check_package_script "format"
check_package_script "format:check"

echo ""
echo "⚙️  Checking configuration content..."
check_eslint_config
check_prettier_config

echo ""
echo "==================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "==================================="

if [ $FAILED -gt 0 ]; then
    echo "❌ Linting configuration validation FAILED"
    exit 1
else
    echo "✅ Linting configuration validation PASSED"
    exit 0
fi
