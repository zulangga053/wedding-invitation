# Stage 1: Build the application
FROM node:22-slim AS builder
WORKDIR /app

# Copy root package.json and lockfile
COPY package.json pnpm-lock.yaml ./
# Copy project-specific package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies using pnpm
RUN npm install -g pnpm@11.20.0
RUN pnpm fetch

# Copy the rest of the source code
COPY . .

# Build only the API application and its dependencies
RUN pnpm install --offline --frozen-lockfile
RUN pnpm turbo build --filter=@momentia/api

# Stage 2: Create the final, small production image
FROM node:22-slim AS runner
WORKDIR /app

# Copy production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3000

# Start the NestJS application
CMD ["node", "apps/api/dist/main.js"]
