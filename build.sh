#!/bin/bash
# Build script that includes copying assets

echo "Building frontend..."
vite build

echo "Building backend..."
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Copying assets to dist..."
cp -r attached_assets dist/attached_assets

echo "Build complete!"
