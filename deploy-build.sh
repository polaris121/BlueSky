#!/bin/bash
set -e

echo "=== Meteor App Build Script for Render ==="
echo "Starting build process..."

# Install Meteor
echo "Installing Meteor..."
curl https://install.meteor.com/ | sh
export PATH="$HOME/.meteor:$PATH"

# Install app dependencies
echo "Installing app dependencies..."
meteor npm install

# Verify @babel/runtime is installed
echo "Ensuring @babel/runtime is available..."
meteor npm install --save @babel/runtime@^7.27.6

# Build the application
echo "Building Meteor application..."
meteor build --directory ./build --architecture os.linux.x86_64 --server-only

# Navigate to server bundle
echo "Installing server dependencies..."
cd build/bundle/programs/server

# Install production dependencies
npm install --production

# Explicitly install babel runtime in server
echo "Installing @babel/runtime in server bundle..."
npm install @babel/runtime@^7.27.6

echo "=== Build completed successfully ==="
echo "Built files location: $(pwd)"
ls -la
