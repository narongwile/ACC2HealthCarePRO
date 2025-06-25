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
RUN node ace build --production


# Stage 2: Create the final runtime image
FROM node:22-alpine AS production

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV ENV_SILENT=true # Disable .env file loading
ENV HOST=0.0.0.0    # Listen to external network connections
ENV PORT=3333
ENV CACHE_VIEWS=true # Enable view caching

# Copy only the necessary production dependencies from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/ace ./ace

EXPOSE ${PORT}

# Start the server
CMD [ "node", "server.js" ]
