# Stage 1: Build the application
FROM node:22-slim AS builder
WORKDIR /app

# Root package manifests + lockfile
COPY package.json pnpm-lock.yaml ./
# Workspace manifests (needed for pnpm to resolve the graph)
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/

# Install all workspace dependencies (includes dev deps for build)
RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build shared, then API in dependency order (avoids turbo/pnpm subprocess check)
RUN cd packages/shared && pnpm build
RUN cd apps/api && pnpm build

# Stage 2: minimal production runtime
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production deps + built output
COPY --from=builder /app/node_modules ./node_modules
# Copy built admin + shared + api artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]