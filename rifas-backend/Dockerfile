FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl1.1-compat

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


