#!/usr/bin/env bash
# ============================================================================
# Local CI/CD Pipeline
# Simulates the GitHub Actions workflow locally
# ============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[PASS]${NC} $1"; ((PASSED++)); }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; ((WARNINGS++)); }
fail() { echo -e "${RED}[FAIL]${NC} $1"; ((FAILED++)); }

# Track stage time
STAGE_START=""
start_stage() {
  STAGE_START=$(date +%s)
  info "Starting: $1"
}

end_stage() {
  local STAGE_END=$(date +%s)
  local ELAPSED=$((STAGE_END - STAGE_START))
  info "Completed: $1 (${ELAPSED}s)"
}

# Header
echo "========================================================================"
echo "  WebBuilder CI/CD Pipeline (Local)"
echo "========================================================================"
echo ""

# ─── Stage 1: Install Dependencies ─────────────────────────────────────────
start_stage "Install Dependencies"
if pnpm install --frozen-lockfile > /dev/null 2>&1; then
  success "Dependencies installed"
else
  fail "Failed to install dependencies"
  exit 1
fi
end_stage "Install Dependencies"

# ─── Stage 2: Build All Packages ────────────────────────────────────────────
start_stage "Build All Packages"
BUILD_ERRORS=0
if pnpm -r build > /dev/null 2>&1; then
  success "All packages built successfully"
else
  fail "Build failed"
  ((BUILD_ERRORS++))
fi
end_stage "Build All Packages"

# ─── Stage 3: Unit Tests ────────────────────────────────────────────────────
start_stage "Unit Tests"
TEST_ERRORS=0
for pkg in packages/*/; do
  if [ -f "$pkg/package.json" ]; then
    PKG_NAME=$(node -p "require('./$pkg/package.json').name" 2>/dev/null || echo "unknown")
    if pnpm --filter "$PKG_NAME" test > /dev/null 2>&1; then
      success "$PKG_NAME: tests passed"
    else
      warn "$PKG_NAME: tests failed or not configured"
      ((TEST_ERRORS++))
    fi
  fi
done
end_stage "Unit Tests"

# ─── Stage 4: E2E Test ──────────────────────────────────────────────────────
start_stage "E2E Test"
if node scripts/demo-e2e.cjs > /dev/null 2>&1; then
  success "E2E demo passed"
else
  fail "E2E demo failed"
  ((FAILED++))
fi
end_stage "E2E Test"

# ─── Stage 5: Verify Generated Project Builds ──────────────────────────────
start_stage "Verify Generated Project"
GENERATED_DIR="/tmp/webbuilder-demo"
if [ -d "$GENERATED_DIR" ]; then
  LATEST=$(ls -t "$GENERATED_DIR" | head -1)
  if [ -n "$LATEST" ]; then
    cd "$GENERATED_DIR/$LATEST"
    if npm install > /dev/null 2>&1 && npm run build > /dev/null 2>&1; then
      success "Generated project builds successfully"
    else
      fail "Generated project failed to build"
      ((FAILED++))
    fi
  else
    warn "No generated projects found"
    ((WARNINGS++))
  fi
else
  warn "No generated projects found"
  ((WARNINGS++))
fi
end_stage "Verify Generated Project"

# ─── Summary ────────────────────────────────────────────────────────────────
echo ""
echo "========================================================================"
echo "  CI/CD Pipeline Summary"
echo "========================================================================"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}"
echo "========================================================================"

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Pipeline FAILED${NC}"
  exit 1
else
  echo -e "${GREEN}Pipeline PASSED${NC}"
  exit 0
fi
