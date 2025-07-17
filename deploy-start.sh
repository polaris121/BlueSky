#!/bin/bash
set -e

echo "=== Starting Meteor App on Render ==="

# Navigate to the bundled application directory
cd /opt/render/build/bundle

# Set environment variables
export PORT=${PORT:-10000}
export ROOT_URL=${ROOT_URL:-http://localhost:$PORT}
export NODE_ENV=production

# Install server dependencies
echo "Installing server dependencies..."
(cd programs/server && npm install)

# Start the application
echo "Starting Node.js application..."
exec node main.js
