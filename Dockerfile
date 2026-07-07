# Multi-stage build for IT Inventory System
FROM node:18-alpine AS frontend-build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY package*.json ./
COPY backend/ ./backend/
COPY .env.example ./.env

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Install backend dependencies
RUN npm ci --only=production

# Create database and uploads directories
RUN mkdir -p database uploads

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "backend/server.js"]
