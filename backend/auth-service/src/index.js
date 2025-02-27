// auth-service/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const config = require('./config');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', userRoutes);

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exam-auth')
  .then(() => {
    console.log('MongoDB bağlantısı başarılı - Auth Service');
    app.listen(PORT, () => {
      console.log(`Auth Service ${PORT} portunda çalışıyor`);
    });
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
  });

// Basit test endpoint'i
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-service' });
});