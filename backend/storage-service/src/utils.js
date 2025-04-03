// backend/utils.js

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/\s+/g, "_") // Boşlukları "_" ile değiştir
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^\w-]/g, ""); // Özel karakterleri kaldır
};

module.exports = { slugify };
