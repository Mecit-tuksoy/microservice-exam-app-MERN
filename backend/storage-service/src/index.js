// storage-service/src/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const testRoutes = require('./routes/testRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Static dosyalar için
app.use('/images', express.static(path.join(__dirname, '../test-data/images')));
app.use('/api/storage/images', express.static(path.join(__dirname, '../test-data/images')));

// Routes
app.use('/api/storage', testRoutes);

// Basit test endpoint'i
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'storage-service' });
});

app.listen(PORT, () => {
  console.log(`Storage Service ${PORT} portunda çalışıyor`);
});