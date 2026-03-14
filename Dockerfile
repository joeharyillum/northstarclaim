FROM node:22-slim AS base
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# Build-time env vars (injected by Railway)
ARG STRIPE_SECRET_KEY
ARG DATABASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG AUTH_SECRET
ARG AUTH_TRUST_HOST
ARG OPENAI_API_KEY
ARG NEXTAUTH_URL

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
