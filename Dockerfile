# ---- build: pre-render the site and bundle the server ----
FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- run: nitro serves the pre-rendered files, no web server config ----
FROM node:22-alpine
WORKDIR /app

# .output is self-contained — the runtime image carries no node_modules.
COPY --from=build /src/.output ./.output

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

EXPOSE 8080
USER node
CMD ["node", ".output/server/index.mjs"]
