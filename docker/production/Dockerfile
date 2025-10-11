# ---- Build stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build TypeScript
RUN npm run build

# Copy certs into dist (so they’re available in final image)
RUN mkdir -p dist/certs && cp -r certs/* dist/certs/

# Copy .env.development into dist
RUN cp .env.development dist/.env.development || echo ".env.development not found"

# ---- Production stage ----
FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy built files only
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/server.js"]
