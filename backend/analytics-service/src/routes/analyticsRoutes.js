const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");
const TestResult = require("../models/TestResult");

// Ziyaretçi sayısını artır
router.post("/visitor", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let visitor = await Visitor.findOne({ date: { $gte: today } });

    if (!visitor) {
      visitor = new Visitor({
        date: today,
        count: 1,
      });
    } else {
      visitor.count += 1;
    }

    await visitor.save();
    res.status(200).json({ message: "Ziyaretçi sayısı güncellendi" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Bugünkü ve toplam ziyaretçi sayısını getir
router.get("/visitors", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisitor = await Visitor.findOne({ date: { $gte: today } });
    const totalVisitors = await Visitor.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);

    const todayCount = todayVisitor ? todayVisitor.count : 0;
    const totalCount = totalVisitors.length > 0 ? totalVisitors[0].total : 0;

    res.json({
      today: todayCount,
      total: totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Test sonucunu kaydet
router.post("/test-results", async (req, res) => {
  try {
    const {
      userId,
      username,
      testId,
      subject,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      emptyAnswers,
      netScore,
      userAnswers,
      correctAnswerMap,
    } = req.body;

    // Verileri doğrula
    if (!userId || !testId || !subject) {
      return res
        .status(400)
        .json({ message: "Eksik veri: userId, testId ve subject zorunludur" });
    }

    const testResult = new TestResult({
      userId,
      username,
      testId,
      subject,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      emptyAnswers,
      netScore,
      userAnswers,
      correctAnswerMap,
    });

    await testResult.save();

    res.status(201).json({ message: "Test sonucu kaydedildi", testResult });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Belirli bir test için sıralama bilgisi getir
router.get("/rankings/:testId/:userId", async (req, res) => {
  try {
    const { testId, userId } = req.params;

    // Önce bu testin subject'ini bul
    const currentTest = await TestResult.findOne({ testId });

    if (!currentTest) {
      return res.json({
        rank: null,
        totalParticipants: 0,
        message: "Bu test için sonuç bulunamadı",
      });
    }

    const subject = currentTest.subject;

    console.log(`TestId: ${testId}, Subject: ${subject}, UserId: ${userId}`);

    // Kullanıcının bu testId için test sonucunu bul
    const userTestResult = await TestResult.findOne({ testId, userId });

    if (!userTestResult) {
      return res.json({
        rank: null,
        totalParticipants: 0,
        message: "Kullanıcı bu testi çözmemiş",
      });
    }

    console.log(`Kullanıcının bu test skoru: ${userTestResult.netScore}`);

    // Bu subject için tüm test sonuçlarını getir
    const allTestResults = await TestResult.find({ subject }).sort({
      netScore: -1,
    });

    // Tüm skorları bir listeye al
    const allScores = allTestResults.map((result) => result.netScore);

    // Kullanıcının bu testteki netScore'unu al
    const userScore = userTestResult.netScore;

    // Kullanıcının skorunu listeye ekle ve sırala
    const updatedScores = [...allScores, userScore].sort((a, b) => b - a);

    // Kullanıcının skorunun sıralamadaki yerini bul
    const rank = updatedScores.indexOf(userScore) + 1;

    // Toplam katılımcı sayısını, tüm test sonuçlarının sayısı olarak belirle
    const totalParticipants = updatedScores.length;

    console.log(`Kullanıcının sıralaması: ${rank} / ${totalParticipants}`);

    res.json({
      rank,
      totalParticipants,
      netScore: userScore,
    });
  } catch (error) {
    console.error("Sıralama bilgisi getirme hatası:", error);
    res.status(500).json({
      message: "Sunucu hatası",
      error: error.message,
      rank: null,
      totalParticipants: 0,
    });
  }
});

module.exports = router;
