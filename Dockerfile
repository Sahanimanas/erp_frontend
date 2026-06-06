# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runtime

WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy .env.production
COPY .env.production .

# Expose port
EXPOSE 5174

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5174 || exit 1

# Start application
CMD ["serve", "-s", "dist", "-l", "5174"]
