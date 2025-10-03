#!/bin/bash
set -e

echo "==> Node.js version:"
node --version
echo "==> npm version:"
npm --version

echo "==> Navigating to frontend directory..."
cd frontend

echo "==> Cleaning npm cache..."
npm cache clean --force

echo "==> Installing dependencies..."
npm install --legacy-peer-deps --verbose

echo "==> Verifying react-scripts installation..."
npx react-scripts --version

echo "==> Building application..."
npm run build

echo "==> Build completed successfully!"
echo "==> Build output:"
ls -la build/