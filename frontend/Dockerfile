# Stage 1: Build
# node:20-slim = Debian/glibc — required for native addons (lightningcss, esbuild)
FROM node:20-slim AS builder

WORKDIR /app

# Copy ONLY package.json — NOT package-lock.json
# The lock file is generated on Windows and pins Windows-specific native
# binary variants (e.g. lightningcss-win32-x64-msvc). Omitting it forces
# npm to resolve the correct Linux binaries fresh on every build.
COPY package.json ./

RUN npm install

# Copy source code (node_modules excluded via .dockerignore)
COPY . .

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
