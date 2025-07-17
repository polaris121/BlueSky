# Stage 1: Build the application
FROM node:20 AS builder

# Install Meteor
RUN npm install -g meteor --unsafe-perm

# Create app directory
WORKDIR /usr/src/app

# Copy application source
# We copy package.json first to leverage Docker layer caching
COPY package*.json ./
RUN meteor npm install

COPY . .

# Build the app, creating a bundle in /usr/src/app/build
RUN meteor build --directory ./build --architecture os.linux.x86_64

# Stage 2: Create the final, smaller runtime image
FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy the built bundle from the builder stage
COPY --from=builder /usr/src/app/build/bundle .

# Install production server dependencies
RUN (cd programs/server && npm install --production)

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
# ROOT_URL and MONGO_URL should be set in Render's environment
ENV PORT=3000

# Start the app
CMD ["node", "main.js"]
