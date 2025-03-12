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

    // Bu konuyu içeren tüm test sonuçlarını getir (tüm girişimleri)
    const allTestResults = await TestResult.find({ subject });

    console.log(
      `${subject} konusu için toplam ${allTestResults.length} sonuç bulundu`
    );

    // Kullanıcının bu subject için en iyi sonucunu bul
    const userTests = allTestResults.filter((test) => test.userId === userId);

    if (userTests.length === 0) {
      return res.json({
        rank: null,
        totalParticipants: allTestResults.length,
        message: "Kullanıcı bu testi çözmemiş",
      });
    }

    const userBestTest = userTests.reduce(
      (best, current) => (current.netScore > best.netScore ? current : best),
      userTests[0]
    );

    console.log(`Kullanıcının en iyi skoru: ${userBestTest.netScore}`);

    // Tüm sonuçları netscore'a göre sırala (her kullanıcının her denemesi dahil)
    const sortedResults = [...allTestResults].sort(
      (a, b) => b.netScore - a.netScore
    );

    // Kullanıcının sıralamasını bul
    const rank =
      sortedResults.findIndex(
        (result) => result._id.toString() === userBestTest._id.toString()
      ) + 1;

    console.log(`Kullanıcının sıralaması: ${rank} / ${allTestResults.length}`);

    res.json({
      rank,
      totalParticipants: allTestResults.length,
      netScore: userBestTest.netScore,
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

// Bu endpoint önceki sürüm, yeni yazılanı yukarıda
router.get("/ranking/:testId/:userId", async (req, res) => {
  try {
    const { testId, userId } = req.params;

    // Test sonuçlarını netScore'a göre sıralı şekilde al
    const results = await TestResult.find({ testId }).sort({ netScore: -1 });

    if (!results.length) {
      return res.status(404).json({ message: "Bu test için sonuç bulunamadı" });
    }

    // Kullanıcının sonucunu bul
    const userIndex = results.findIndex((result) => result.userId === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        message: "Kullanıcı bu testi çözmemiş",
        rank: null,
        totalParticipants: results.length,
        netScore: null,
      });
    }

    res.json({
      rank: userIndex + 1,
      totalParticipants: results.length,
      netScore: results[userIndex].netScore,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

module.exports = router;
