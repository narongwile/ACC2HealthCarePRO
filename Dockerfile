# Build AdonisJS
FROM node:22-alpine as builder
# Set directory for all files
WORKDIR .
# Copy over package.json files
COPY package*.json ./
# Install all packages
RUN npm install
RUN npm update
# Copy over source code
COPY . .
# Build AdonisJS for production
# RUN npm run build --production
RUN npm run build


# Build final runtime container
FROM node:22-alpine
# Set environment variables
ENV NODE_ENV=development
# Disable .env file loading
ENV ENV_SILENT=true
# Listen to external network connections
# Otherwise it would only listen in-container ones
ENV HOST=0.0.0.0
# Set port to listen
ENV PORT=3333
ENV CACHE_VIEWS=true

# Set home dir
WORKDIR .
# Copy over built files
COPY --from=builder ./build .
# Install only required packages
RUN npm ci --production
# Expose port to outside world
EXPOSE 3333
# Start server up
CMD [ "node", "server.js" ]
