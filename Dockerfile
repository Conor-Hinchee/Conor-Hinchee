# ---- Stage 1: build the static site ----
FROM node:24-alpine AS build

WORKDIR /app

# Playwright is a devDependency; its postinstall wants to download browsers,
# which we never need inside the image.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Stage 2: serve it ----
FROM nginx:1.27-alpine AS serve

# nginx:alpine runs envsubst over /etc/nginx/templates/*.template at boot and
# writes the result into /etc/nginx/conf.d/. That is how we pick up Cloud Run's
# injected $PORT instead of hardcoding 80.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf

COPY --from=build /app/dist /usr/share/nginx/html

ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
