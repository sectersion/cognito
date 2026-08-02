FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN apk add --no-cache python3 make g++
RUN npm ci --omit=dev

COPY . .
RUN npm run build:frontend

FROM node:20-alpine

RUN apk add --no-cache dumb-init
RUN addgroup -S cognito && adduser -S cognito -G cognito

WORKDIR /app

COPY --from=builder --chown=cognito:cognito /app .

USER cognito

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]
