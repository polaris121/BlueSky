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

# Build the application
echo "Building Meteor application..."
meteor build --directory /opt/render/build --architecture os.linux.x86_64

echo "=== Build completed successfully ==="
