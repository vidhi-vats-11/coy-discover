FROM node:22-slim

# Prisma needs openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate

COPY src ./src

ENV PORT=5000
EXPOSE 5000

# Create tables, add the 30 profiles on first run, then start the API
CMD ["sh", "-c", "npx prisma migrate deploy && node src/data/seed.js --if-empty && node src/server.js"]
