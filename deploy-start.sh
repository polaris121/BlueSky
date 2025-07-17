#!/bin/bash
set -e

echo "=== Starting Meteor App on Render ==="

# Navigate to the server bundle directory
cd build/bundle/programs/server

# Install dependencies again right before starting
echo "Installing dependencies in server directory..."
npm install

# Navigate back to the bundle root
cd ../../

# Set environment variables
export PORT=${PORT:-10000}
export ROOT_URL=${ROOT_URL:-http://localhost:$PORT}
export NODE_ENV=production

echo "Environment:"
echo "  PORT: $PORT"
echo "  ROOT_URL: $ROOT_URL"
echo "  NODE_ENV: $NODE_ENV"

echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Start the application
echo "Starting Node.js application..."
exec node main.js
