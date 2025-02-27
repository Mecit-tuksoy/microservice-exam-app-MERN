// test-service/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const testRoutes = require('./routes/testRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tests', testRoutes);

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exam-tests')
  .then(() => {
    console.log('MongoDB bağlantısı başarılı - Test Service');
    app.listen(PORT, () => {
      console.log(`Test Service ${PORT} portunda çalışıyor`);
    });
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
  });

// Basit test endpoint'i
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'test-service' });
});