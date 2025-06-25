# Stage 1: Build the AdonisJS application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

# Install production and development dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build AdonisJS for production
RUN node ace build --production --ignore-ts-errors


# Stage 2: Create the final runtime image
FROM node:22-alpine AS production

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
# Disable .env file loading
ENV ENV_SILENT=true
# Listen to external network connections
ENV HOST=0.0.0.0
ENV PORT=3333
# Enable view caching
ENV CACHE_VIEWS=true

# Copy package.json and package-lock.json for production dependency installation
COPY package.json package-lock.json ./
# Install only production dependencies
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

# Copy essential AdonisJS runtime directories/files that are not part of `build` output
COPY --from=builder /app/config ./config
COPY --from=builder /app/start ./start
COPY --from=builder /app/providers ./providers
COPY --from=builder /app/database ./database # If you need migrations or seeders at runtime
COPY --from=builder /app/env.ts ./env.ts # Copy env.ts if used for configuration

EXPOSE ${PORT}

# Start the server
CMD [ "node", "server.js" ] 