// auth-service/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'exam-app-secret-key';

// Kullanıcı Kaydı
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Kullanıcı adı kontrolü
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }
    
    // Yeni kullanıcı oluşturma
    const user = new User({ username, password });
    await user.save();
    
    // JWT token oluşturma
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcı Girişi
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Kullanıcı kontrolü
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    // Şifre kontrolü
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    // JWT token oluşturma
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcı bilgilerini getir
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Test sonuçlarını kaydetme
router.post('/test-results', auth, async (req, res) => {
  try {
    const { testId, subject, totalQuestions, correctAnswers, wrongAnswers, emptyAnswers, netScore, ranking, totalParticipants } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    user.testResults.push({
      testId,
      subject,
      date: new Date(),
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      emptyAnswers,
      netScore,
      ranking,
      totalParticipants
    });
    
    await user.save();
    res.status(201).json({ message: 'Test sonuçları kaydedildi', testResults: user.testResults });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcının test sonuçlarını getirme
router.get('/test-results', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Sonuçları tarihe göre sırala (en yeniden en eskiye)
    const sortedResults = user.testResults.sort((a, b) => b.date - a.date);
    
    res.json(sortedResults);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;