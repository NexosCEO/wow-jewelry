#!/bin/bash
# Custom deployment script that includes assets

echo "=== Starting build process ==="

# Build frontend
echo "Building frontend with Vite..."
vite build

# Build backend
echo "Building backend with esbuild..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Copy assets to dist folder
echo "Copying attached_assets to dist..."
mkdir -p dist/attached_assets
cp -r attached_assets/* dist/attached_assets/

echo "=== Build complete! ==="
echo "Assets location: dist/attached_assets"
ls -la dist/ | grep attached
