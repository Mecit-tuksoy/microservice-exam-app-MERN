FROM node:20-alpine AS build

WORKDIR /usr/src/app

# Sadece package.json ve package-lock.json'ı kopyalayarak layer caching'den yararlanıyoruz
COPY package*.json ./

# Sadece production bağımlılıklarını kuruyoruz
RUN npm ci --only=production

# Sadece gerekli dosyaları kopyalıyoruz
FROM node:20-alpine

# Node.js uygulamaları için production ortamı
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Build aşamasından node_modules'ı kopyalıyoruz
COPY --from=build /usr/src/app/node_modules ./node_modules

# Uygulamanın kaynak dosyalarını kopyalıyoruz (node_modules ve gereksiz dosyalar hariç)
COPY --chown=node:nodejs package*.json ./
COPY --chown=node:nodejs src ./src

# Dışarıdan erişilebilecek port
EXPOSE 3002

# node kullanıcısına geçiyoruz
USER node

# Uygulamayı başlatıyoruz
CMD ["npm", "start"]