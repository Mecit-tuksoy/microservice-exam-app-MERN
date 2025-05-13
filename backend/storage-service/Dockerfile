FROM node:20-alpine

# Çalışma dizini oluştur
WORKDIR /usr/src/app

# Daha iyi katmanlama için önce package dosyalarını kopyala
COPY package*.json ./

# Sadece production bağımlılıklarını yükle
RUN npm ci --only=production

# Uygulama kodlarını kopyala (test-data hariç)
COPY ./src ./src

# Non-root kullanıcı ekle (güvenlik için)
RUN chown -R node:node /usr/src/app
USER node

# Uygulamanın çalışacağı portu belirt
EXPOSE 3003

# Uygulamayı başlat
CMD ["npm", "start"]
