# --- Stage 1: Build Stage ---
FROM node:18-alpine AS build
WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source and build production bundle
COPY . .
RUN npm run build

# --- Stage 2: Production Web Server Stage ---
FROM nginx:alpine AS runner

# Copy compiled static assets from build stage to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
