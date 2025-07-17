#!/bin/bash
set -e

echo "=== Meteor App Build Script for Render ==="

# Install Meteor
echo "Installing Meteor..."
curl https://install.meteor.com/ | sh
export PATH="$HOME/.meteor:$PATH"

# Install npm dependencies defined in package.json
echo "Installing npm dependencies..."
meteor npm install

# Build the application into a 'build' directory in the repo root
echo "Building Meteor application..."
meteor build --directory ./build --architecture os.linux.x86_64

# Install server dependencies directly into the bundle
echo "Installing server dependencies into the bundle..."
(cd ./build/bundle/programs/server && npm install --production)

echo "=== Build completed successfully ==="
