# Build aşaması
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# # Çalışma aşaması
# FROM node:20-alpine AS production

# WORKDIR /usr/src/app

# # Sadece production bağımlılıklarını yükleyelim
# COPY package*.json ./
# RUN npm install --only=production

# # Build aşamasından sadece build klasörünü kopyalayalım
# COPY --from=build /usr/src/app/build ./build

# React uygulamasını çalıştırmak için serve'i yükleyelim
RUN npm install -g serve

EXPOSE 4000

# serve komutunu kullanıyoruz çünkü npm start development modunda çalışır ve gereksiz kaynak tüketir
# serve komutu production build'i daha verimli şekilde sunar
CMD ["serve", "-s", "build", "-l", "4000"]