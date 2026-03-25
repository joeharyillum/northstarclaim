FROM node:22-slim AS base
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install dependencies with legacy-peer-deps to ignore strict conflicts
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm install --legacy-peer-deps && npx prisma generate

# Build-time env vars (injected by Railway — NOT baked into image layers)
ARG STRIPE_SECRET_KEY
ARG DATABASE_URL
ARG NEXT_PUBLIC_APP_URL
ARG AUTH_SECRET
ARG AUTH_TRUST_HOST
ARG OPENAI_API_KEY
ARG NEXTAUTH_URL

# Copy source and build
COPY . .
RUN npm run build

# ═══════════════════════════════════════════════════════════════
# PRODUCTION STAGE — minimal attack surface
# ═══════════════════════════════════════════════════════════════
FROM node:22-slim AS production
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Create non-root user for security (don't run as root in production)
RUN groupadd -r appuser && useradd -r -g appuser -s /bin/false appuser

# Copy only production artifacts
COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/next.config.ts ./

# Set ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

ENV NODE_ENV=production
ENV PORT=3000

# Don't expose internal details
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["npm", "run", "start"]
