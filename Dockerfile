FROM node:22-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

WORKDIR /app

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

ARG NEXT_PUBLIC_UMAMI_ID
ARG NEXT_PUBLIC_UMAMI_URL

ENV NEXT_PUBLIC_UMAMI_ID=$NEXT_PUBLIC_UMAMI_ID
ENV NEXT_PUBLIC_UMAMI_URL=$NEXT_PUBLIC_UMAMI_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma: skema + migrasi + CLI (untuk `migrate deploy` saat start) + engine
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Folder data untuk file SQLite (mount volume ke sini di production)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

# Terapkan migrasi lalu jalankan server
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
