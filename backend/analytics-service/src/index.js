// analytics-service/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analytics', analyticsRoutes);

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exam-analytics')
  .then(() => {
    console.log('MongoDB bağlantısı başarılı - Analytics Service');
    app.listen(PORT, () => {
      console.log(`Analytics Service ${PORT} portunda çalışıyor`);
    });
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
  });

// Basit test endpoint'i
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'analytics-service' });
});