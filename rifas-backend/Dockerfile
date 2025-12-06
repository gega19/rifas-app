FROM node:20-alpine

# Install OpenSSL and create compatibility symlinks for Prisma
RUN apk add --no-cache openssl openssl-dev && \
    ln -s /usr/lib/libssl.so.3 /usr/lib/libssl.so.1.1 2>/dev/null || true && \
    ln -s /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so.1.1 2>/dev/null || true

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start server (run migrations first, then start)
CMD ["npm", "run", "start:prod"]


