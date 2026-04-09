# Stage 1: Build
# Use node:20-slim (Debian/glibc) NOT alpine (musl) to avoid native module
# binary mismatches with packages like lightningcss, esbuild, etc.
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install all dependencies fresh (node_modules excluded via .dockerignore)
RUN npm install

# Copy source code (node_modules excluded via .dockerignore)
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
