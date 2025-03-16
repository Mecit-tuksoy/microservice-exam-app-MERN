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

    // Kullanıcının en son çözdüğü test sonucunu bul
    const userLatestTest = await TestResult.findOne(
      { userId, testId },
      {},
      { sort: { createdAt: -1 } }
    );

    if (!userLatestTest) {
      return res.json({
        rank: null,
        totalParticipants: 0,
        message: "Kullanıcı bu testi çözmemiş",
      });
    }

    console.log(`Kullanıcının son test skoru: ${userLatestTest.netScore}`);

    // Bu konuyu içeren tüm kullanıcıların en iyi sonuçlarını getir
    // Önce tüm kullanıcıların ID'lerini al
    const allUserIds = await TestResult.distinct("userId", { subject });

    // Her kullanıcının en iyi sonucunu bul
    let bestScores = [];
    for (const uid of allUserIds) {
      const bestResult = await TestResult.find({ subject, userId: uid })
        .sort({ netScore: -1 })
        .limit(1);

      if (bestResult.length > 0) {
        bestScores.push(bestResult[0]);
      }
    }

    // Tüm en iyi sonuçları sırala
    const sortedResults = bestScores.sort((a, b) => b.netScore - a.netScore);

    // Kullanıcının son testinin, herkesin en iyi sonuçları arasındaki yerini bul
    let rank = 0;
    for (let i = 0; i < sortedResults.length; i++) {
      if (userLatestTest.netScore >= sortedResults[i].netScore) {
        rank = i + 1;
        break;
      }
    }

    // Eğer sıralama bulunmadıysa (kullanıcı en düşük skora sahipse)
    if (rank === 0 && sortedResults.length > 0) {
      rank = sortedResults.length + 1;
    }

    console.log(
      `Kullanıcının son testinin sıralaması: ${rank} / ${sortedResults.length}`
    );

    res.json({
      rank,
      totalParticipants: sortedResults.length,
      netScore: userLatestTest.netScore,
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
