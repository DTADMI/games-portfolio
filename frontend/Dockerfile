# Development stage
FROM oven/bun:1.1.20-alpine AS development

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["bun", "run", "dev"]

# Production stage
FROM oven/bun:1.1.20-alpine AS production

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["bun", "run", "start"]
