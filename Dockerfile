FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --ignore-scripts

COPY . .

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db"
RUN pnpm prisma generate
RUN pnpm run build

FROM node:22-alpine AS production

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main"]
