# Use a single, consistent stage to eliminate multi-stage complexities.
FROM node:20

# Set up the working directory
WORKDIR /usr/src/app

# Install Meteor
RUN npm install -g meteor --unsafe-perm

# Copy package files and install dependencies to leverage caching
COPY package*.json ./
RUN meteor npm install --save
# Explicitly install @babel/runtime as suggested by Render logs for robustness
RUN meteor npm install --save @babel/runtime

# Copy the rest of the application source
COPY . .

# Build the application. This creates the bundle in /usr/src/app/build
RUN meteor build --directory ./build --architecture os.linux.x86_64

# --- Runtime Setup ---

# Set the working directory to the bundled app's root
WORKDIR /usr/src/app/build/bundle

# Install server dependencies directly into the final location.
# This is the most critical step.
RUN (cd programs/server && npm install --production --unsafe-perm)

# Set environment variables for runtime
# ROOT_URL and MONGO_URL should be set in Render's environment
ENV PORT=3000
ENV NODE_ENV=production
# Use an absolute path for NODE_PATH to be explicit.
ENV NODE_PATH=/usr/src/app/build/bundle/programs/server/node_modules

# Expose the port
EXPOSE 3000

# The command to start the application
CMD ["node", "main.js"]
