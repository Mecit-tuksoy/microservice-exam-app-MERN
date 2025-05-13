FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

# Sadece gerekli dosyaları kopyala
COPY src/ ./src/

# Non-root kullanıcı ile çalıştır
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3001

# Ortam değişkenlerini tanımlama
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "src/index.js"]