# Multi-stage build
FROM node:24 AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
COPY frontend/admin/package.json ./frontend/admin/
COPY frontend/client/package.json ./frontend/client/
RUN npm install

COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/
COPY backend/tsoa.json ./backend/

COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/

COPY frontend/admin/public ./frontend/admin/public
COPY frontend/admin/src ./frontend/admin/src
COPY frontend/admin/index.html ./frontend/admin/
COPY frontend/admin/vite.config.js ./frontend/admin/

COPY frontend/client/public ./frontend/client/public
COPY frontend/client/src ./frontend/client/src
COPY frontend/client/index.html ./frontend/client/
COPY frontend/client/vite.config.js ./frontend/client/

RUN npm --workspace shared run build \
  && npm --workspace backend run build \
  && npm --workspace frontend/admin run build \
  && npm --workspace frontend/client run build

FROM nginx:latest as front-admin

COPY --from=builder /app/frontend/admin/dist /usr/share/nginx/html/admin
COPY --from=builder /app/frontend/admin/dist/index.html /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80/tcp

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]


FROM nginx:latest as front-client

COPY --from=builder /app/frontend/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80/tcp

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]


FROM node:24 AS api
WORKDIR /app
COPY package*.json ./
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/
RUN npm install --production
# # Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# # Copy built applications
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared/dist ./shared/dist

# # Change ownership to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

# # Expose ports
EXPOSE 3000


# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD wget --spider --quiet http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "backend/dist/index.js"]
