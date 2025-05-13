FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

# Sadece gerekli dosyaları kopyala
COPY src/ ./src/

# Non-root kullanıcı ile çalıştır
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3004

# Ortam değişkenlerini tanımlama
ENV NODE_ENV=production
ENV PORT=3004
ENV STORAGE_SERVICE_URL=http://storage-service:3003/api/storage
ENV ANALYTICS_SERVICE_URL=http://analytics-service:3002/api/analytics

CMD ["node", "src/index.js"]