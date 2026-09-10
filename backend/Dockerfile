FROM node:22-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package.json tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN npm install

# Copy source files
COPY shared ./shared
COPY backend ./backend

# Build shared first, then backend
RUN npm run build --workspace=@wecode/shared
RUN npm run prisma:generate --workspace=@wecode/backend
RUN npm run build --workspace=@wecode/backend

# Production Runner
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN npm install --omit=dev

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000

CMD ["node", "backend/dist/index.js"]
