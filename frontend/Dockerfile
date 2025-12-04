# Development stage
FROM oven/bun:1.1.20-alpine AS development

WORKDIR /app

# Copy source code first so we can conditionally use a lockfile if present
COPY . .

# Install dependencies
# If bun.lockb exists in the context, use it with --frozen-lockfile; otherwise do a best-effort install
RUN if [ -f bun.lockb ]; then \
      echo "Using bun.lockb for deterministic install"; \
      bun install --frozen-lockfile; \
    else \
      echo "bun.lockb not found; running non-frozen install (consider committing frontend/bun.lockb)"; \
      bun install; \
    fi

# Expose port
EXPOSE 8080

# Start development server
CMD ["bun", "run", "dev"]

# Production stage
FROM oven/bun:1.1.20-alpine AS production

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy package files first for better layer caching
COPY package.json bun.lock* ./

# Install production dependencies only
RUN if [ -f bun.lock ]; then \
      echo "Using bun.lock for deterministic install"; \
      bun install --frozen-lockfile --production; \
    else \
      echo "bun.lock not found; running non-frozen install"; \
      bun install --production; \
    fi

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Expose port
EXPOSE 8080

# Start production server
CMD ["bun", "run", "start", "--hostname", "0.0.0.0", "--port", "8080"]
