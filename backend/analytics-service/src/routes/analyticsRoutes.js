// analytics-service/src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const TestResult = require('../models/TestResult');

// Ziyaretçi sayısını artır
router.post('/visitor', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let visitor = await Visitor.findOne({ date: { $gte: today } });
    
    if (!visitor) {
      visitor = new Visitor({
        date: today,
        count: 1
      });
    } else {
      visitor.count += 1;
    }
    
    await visitor.save();
    res.status(200).json({ message: 'Ziyaretçi sayısı güncellendi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Bugünkü ve toplam ziyaretçi sayısını getir
router.get('/visitors', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayVisitor = await Visitor.findOne({ date: { $gte: today } });
    const totalVisitors = await Visitor.aggregate([
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    
    const todayCount = todayVisitor ? todayVisitor.count : 0;
    const totalCount = totalVisitors.length > 0 ? totalVisitors[0].total : 0;
    
    res.json({
      today: todayCount,
      total: totalCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Test sonucunu kaydet
router.post('/test-results', async (req, res) => {
  try {
    const { userId, username, testId, subject, totalQuestions, correctAnswers, wrongAnswers, emptyAnswers, netScore } = req.body;
    
    const testResult = new TestResult({
      userId,
      username,
      testId,
      subject,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      emptyAnswers,
      netScore
    });
    
    await testResult.save();
    
    res.status(201).json({ message: 'Test sonucu kaydedildi', testResult });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Belirli bir test için sıralama bilgisi getir
router.get('/rankings/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    
    const results = await TestResult.find({ testId }).sort({ netScore: -1 });
    
    const rankings = results.map((result, index) => ({
      userId: result.userId,
      username: result.username,
      netScore: result.netScore,
      rank: index + 1,
      totalParticipants: results.length
    }));
    
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Kullanıcının bir testteki sıralamasını getir
router.get('/ranking/:testId/:userId', async (req, res) => {
  try {
    const { testId, userId } = req.params;
    
    const results = await TestResult.find({ testId }).sort({ netScore: -1 });
    
    const userIndex = results.findIndex(result => result.userId === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Kullanıcı bu testi çözmemiş' });
    }
    
    res.json({
      rank: userIndex + 1,
      totalParticipants: results.length,
      netScore: results[userIndex].netScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;