#!/bin/bash
# Build script for static export (GitHub Pages, Netlify, etc.)

# Temporarily move API routes out of the way
if [ -d "src/app/api" ]; then
  mv src/app/api src/app/_api_backup
fi

# Set static export mode and build
STATIC_EXPORT=true npx next build

# Restore API routes
if [ -d "src/app/_api_backup" ]; then
  mv src/app/_api_backup src/app/api
fi

echo "✅ Static build complete! Output in ./out/"
