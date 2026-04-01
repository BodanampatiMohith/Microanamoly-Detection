FROM node:18-slim as builder

WORKDIR /app

ARG VITE_BUILD_OUT_DIR=dist
ARG VITE_API_BASE_URL=/api
ENV VITE_BUILD_OUT_DIR=$VITE_BUILD_OUT_DIR
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Runtime stage
FROM node:18-slim

WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
