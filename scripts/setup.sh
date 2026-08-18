#!/bin/bash
# Setup script for WebBuilder development environment

echo "🚀 Setting up WebBuilder development environment..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@9
fi

echo "✅ pnpm $(pnpm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build packages
echo "🔨 Building packages..."
pnpm build

echo ""
echo "✨ WebBuilder is ready!"
echo ""
echo "Quick start:"
echo "  pnpm dev          # Start development servers"
echo "  pnpm build        # Build all packages"
echo "  pnpm test         # Run all tests"
echo "  pnpm cli create my-app   # Create a new project"
echo ""
echo "Documentation: ./README.md"
