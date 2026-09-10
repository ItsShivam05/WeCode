FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY runner/package.json ./runner/

RUN npm install

COPY shared ./shared
COPY backend/prisma ./backend/prisma
COPY runner ./runner

RUN npm run build --workspace=@wecode/shared
RUN npm run prisma:generate --workspace=@wecode/backend
RUN npm run build --workspace=@wecode/runner

FROM node:22-alpine AS runner

# Install docker CLI to interact with the host docker daemon socket if needed
RUN apk add --no-cache docker-cli

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY runner/package.json ./runner/

RUN npm install --omit=dev

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/runner/dist ./runner/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

CMD ["node", "runner/dist/index.js"]
