// test-service/src/routes/testRoutes.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const ActiveTest = require("../models/ActiveTest");
const TestResult = require("../models/TestResult");

// Servis URL'leri
const STORAGE_SERVICE_URL =
  process.env.STORAGE_SERVICE_URL || "http://localhost:3003/api/storage";
const ANALYTICS_SERVICE_URL =
  process.env.ANALYTICS_SERVICE_URL || "http://localhost:3002/api/analytics";

// JWT doğrulama middleware
const authenticateToken = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(401)
      .json({ message: "Erişim reddedildi. Token bulunamadı" });

  // Burada token'ı doğrulama işlemi yapılmalı
  // Basit bir yapı için kullanıcı bilgilerini req.user'a ekleyeceğiz
  try {
    // Normalde JWT verify işlemi burada yapılır
    // Şimdilik header'dan gelen kullanıcı bilgilerini kullanacağız
    req.user = {
      id: req.header("user-id"),
      username: req.header("username"),
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Geçersiz token" });
  }
};

// Mevcut testleri listele
router.get("/available", authenticateToken, async (req, res) => {
  try {
    // Storage Service'den mevcut konu başlıklarını al
    const response = await axios.get(`${STORAGE_SERVICE_URL}/subjects`);

    // Kullanıcının aktif bir testi var mı kontrol et
    const activeTest = await ActiveTest.findOne({
      userId: req.user.id,
      completed: false,
    });

    const subjects = response.data;

    if (activeTest) {
      // Aktif test varsa, o testi işaretle
      const availableTests = subjects.map((subject) => ({
        ...subject,
        active: subject.subject === activeTest.subject,
        remainingTime: calculateRemainingTime(activeTest),
      }));

      res.json(availableTests);
    } else {
      // Aktif test yoksa normal liste dön
      const availableTests = subjects.map((subject) => ({
        ...subject,
        active: false,
        remainingTime: null,
      }));

      res.json(availableTests);
    }
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Yeni test başlat
router.post(
  "/start/:sinif/:ders/:konu",
  authenticateToken,
  async (req, res) => {
    try {
      const { sinif, ders, konu } = req.params;
      // Karşılaştırma ve saklama kolaylığı için subject'i bu şekilde tanımlıyoruz
      const subject = `${sinif}/${ders}/${konu}`;

      // Kullanıcının aktif bir testi var mı kontrol et
      const existingTest = await ActiveTest.findOne({
        userId: req.user.id,
        completed: false,
      });

      if (existingTest) {
        // Aynı konuysa, devam etsin
        if (existingTest.subject === subject) {
          const remainingTime = calculateRemainingTime(existingTest);

          // Storage Service'den test detaylarını al
          const testResponse = await axios.get(
            `${STORAGE_SERVICE_URL}/test/${sinif}/${ders}/${konu}`
          );

          return res.json({
            testId: existingTest._id,
            subject,
            duration: existingTest.duration,
            remainingTime,
            questions: testResponse.data.questions,
            answers: Object.fromEntries(existingTest.answers) || {},
          });
        }

        // Farklı bir konuysa, önceki testi tamamla
        existingTest.completed = true;
        await existingTest.save();
      }

      // Storage Service'den test detaylarını al
      const testResponse = await axios.get(
        `${STORAGE_SERVICE_URL}/test/${sinif}/${ders}/${konu}`
      );

      // Yeni test oluştur
      const newTest = new ActiveTest({
        userId: req.user.id,
        subject,
        duration: testResponse.data.duration,
        startTime: new Date(),
        answers: {},
        completed: false,
      });

      await newTest.save();

      res.json({
        testId: newTest._id,
        subject,
        duration: newTest.duration,
        remainingTime: newTest.duration * 60, // dakikadan saniyeye çevirme
        questions: testResponse.data.questions,
        answers: {},
      });
    } catch (error) {
      res.status(500).json({ message: "Sunucu hatası", error: error.message });
    }
  }
);

// Test cevabını kaydet
router.post("/answer/:testId", authenticateToken, async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionId, answer } = req.body;

    // Testi bul
    const test = await ActiveTest.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test bulunamadı" });
    }

    if (test.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bu testi cevaplama yetkiniz yok" });
    }

    if (test.completed) {
      return res.status(400).json({ message: "Bu test zaten tamamlanmış" });
    }

    // Kalan süreyi kontrol et
    const remainingTime = calculateRemainingTime(test);
    if (remainingTime <= 0) {
      // Süre bitmişse testi tamamla
      test.completed = true;
      await test.save();
      return res.status(400).json({ message: "Test süresi dolmuş" });
    }

    // Cevabı kaydet veya güncelle
    if (answer === null || answer === "") {
      test.answers.set(questionId, "");
    } else {
      test.answers.set(questionId, answer);
    }

    await test.save();

    res.json({ message: "Cevap kaydedildi" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Testi tamamla
router.post("/complete/:testId", authenticateToken, async (req, res) => {
  try {
    const test = await ActiveTest.findById(req.params.testId);
    if (!test) {
      return res.status(404).json({ message: "Test bulunamadı" });
    }

    const { answers: clientAnswers } = req.body;
    if (clientAnswers && typeof clientAnswers === "object") {
      for (const [questionId, ans] of Object.entries(clientAnswers)) {
        test.answers.set(questionId, ans ?? "");
      }
      await test.save();
    }

    test.completed = true;
    await test.save();

    const answers = Object.fromEntries(test.answers);
    const validationResponse = await axios.post(
      `${STORAGE_SERVICE_URL}/validate/${test.subject}`,
      { answers }
    );
    const result = validationResponse.data;

    const userAnswers = {};
    const correctAnswerMap = {};
    result.details.forEach((detail) => {
      const key = `q${detail.questionNo}`;
      userAnswers[key] = detail.userAnswer;
      correctAnswerMap[key] = detail.correctAnswer;
    });

    // Test sonuç objesi oluştur
    const testResultData = {
      userId: req.user.id,
      username: req.user.username,
      testId: test._id,
      subject: test.subject,
      duration: test.duration,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctCount,
      wrongAnswers: result.wrongCount,
      emptyAnswers: result.emptyCount,
      netScore: result.netScore,
      userAnswers,
      correctAnswerMap,
    };

    // Önce analytics servisine sonucu gönder
    try {
      await axios.post(`${ANALYTICS_SERVICE_URL}/test-results`, testResultData);
    } catch (analyticsError) {
      console.error(
        "Test sonucu analytics servisine gönderilemedi:",
        analyticsError.message
      );
      // Kritik olmayan hata, devam edebiliriz
    }

    // Sıralama bilgisini almak için analytics servisine istek yap
    let rank = null;
    let totalParticipants = null;
    try {
      const analyticsResponse = await axios.get(
        `${ANALYTICS_SERVICE_URL}/rankings/${test._id}/${req.user.id}`
      );
      rank = analyticsResponse.data.rank;
      totalParticipants = analyticsResponse.data.totalParticipants;
    } catch (analyticsError) {
      console.error("Sıralama bilgisi alınamadı:", {
        message: analyticsError.message,
        status: analyticsError.response?.status,
        data: analyticsError.response?.data,
      });
    }

    // Rank bilgisini ekle
    testResultData.rank = rank;
    testResultData.totalParticipants = totalParticipants;

    // Test sonucunu veritabanına kaydet
    const testResult = new TestResult(testResultData);
    await testResult.save();

    return res.json({
      ...result,
      testId: test._id,
      resultId: testResult._id,
      userAnswers,
      correctAnswerMap,
      rank,
      totalParticipants,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Kullanıcının test geçmişini getir
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.user.id })
      .sort({ date: -1 }) // Tarihe göre sırala (en yeniden en eskiye)
      .exec();

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Belirli bir test sonucunu getir
router.get("/result/:resultId", authenticateToken, async (req, res) => {
  try {
    const result = await TestResult.findById(req.params.resultId);
    if (!result) {
      return res.status(404).json({ message: "Sonuç bulunamadı" });
    }
    if (result.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bu sonucu görüntüleme yetkiniz yok" });
    }
    res.json(result); // userAnswers ve correctAnswerMap otomatik olarak dahil edilir
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Aktif testi getir
router.get("/active/:testId", authenticateToken, async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await ActiveTest.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test bulunamadı" });
    }

    if (test.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Bu testi görüntüleme yetkiniz yok" });
    }

    // Storage Service'den test detaylarını al
    const testResponse = await axios.get(
      `${STORAGE_SERVICE_URL}/test/${test.subject}`
    );

    res.json({
      testId: test._id,
      subject: test.subject,
      duration: test.duration,
      remainingTime: calculateRemainingTime(test),
      questions: testResponse.data.questions,
      answers: Object.fromEntries(test.answers) || {},
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Search for tests
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const { term } = req.query;

    if (!term || term.length < 3) {
      return res.json([]);
    }

    // Search in storage service
    const response = await axios.get(
      `${STORAGE_SERVICE_URL}/search?term=${encodeURIComponent(term)}`
    );

    const searchResults = response.data.map((test) => ({
      sinif: test.sinif,
      ders: test.ders,
      konu: test.konu,
      questionCount: test.questionCount || 0,
    }));

    res.json(searchResults);
  } catch (error) {
    console.error("Arama sırasında hata:", error);
    res.status(500).json({
      message: "Arama sırasında bir hata oluştu",
      error: error.message,
    });
  }
});

// Get recent tests for a user
router.get("/recent/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Bu bilgilere erişim yetkiniz yok" });
    }

    // Get recent test results for the user
    const recentResults = await TestResult.find({ userId })
      .sort({ date: -1 })
      .limit(3)
      .lean();

    // Map to the format expected by the frontend
    const recentTests = recentResults.map((result) => {
      const [sinif, ders, konu] = result.subject.split("/");
      return {
        sinif,
        ders,
        konu,
        lastAttemptDate: new Date(result.date).toLocaleDateString(),
        score: result.netScore,
        resultId: result._id,
      };
    });

    res.json(recentTests);
  } catch (error) {
    console.error("Son testler alınırken hata:", error);
    res.status(500).json({
      message: "Son testler alınırken bir hata oluştu",
      error: error.message,
    });
  }
});

// Get recommended tests for a user
router.get("/recommended/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Bu bilgilere erişim yetkiniz yok" });
    }

    // Get user's test history
    const testHistory = await TestResult.find({ userId }).lean();

    // Get list of all available subjects from storage service
    const allSubjectsResponse = await axios.get(
      `${STORAGE_SERVICE_URL}/subjects`
    );
    const allSubjects = allSubjectsResponse.data;

    // Filter out subjects the user has already mastered (e.g., high scores)
    const completedSubjects = new Set(
      testHistory.map((result) => result.subject)
    );

    // Simple recommendation algorithm:
    // 1. First, recommend subjects the user hasn't tried yet
    // 2. Then, recommend subjects where the user performed poorly

    let recommendedTests = [];

    // Find subjects the user hasn't tried yet
    const untried = allSubjects
      .filter(
        (subject) =>
          !completedSubjects.has(
            `${subject.sinif}/${subject.ders}/${subject.konu}`
          )
      )
      .slice(0, 2); // Limit to 2

    recommendedTests = [...untried];

    // If we need more recommendations, add subjects where the user scored poorly
    if (recommendedTests.length < 3) {
      // Group results by subject and get average score
      const subjectScores = {};
      testHistory.forEach((result) => {
        if (!subjectScores[result.subject]) {
          subjectScores[result.subject] = {
            totalScore: 0,
            count: 0,
            average: 0,
          };
        }
        subjectScores[result.subject].totalScore += result.netScore;
        subjectScores[result.subject].count += 1;
      });

      // Calculate averages
      Object.keys(subjectScores).forEach((subject) => {
        subjectScores[subject].average =
          subjectScores[subject].totalScore / subjectScores[subject].count;
      });

      // Sort by lowest score
      const poorPerformance = Object.entries(subjectScores)
        .sort((a, b) => a[1].average - b[1].average)
        .map(([subject]) => {
          const [sinif, ders, konu] = subject.split("/");
          return allSubjects.find(
            (s) => s.sinif === sinif && s.ders === ders && s.konu === konu
          );
        })
        .filter(Boolean)
        .slice(0, 3 - recommendedTests.length);

      recommendedTests = [...recommendedTests, ...poorPerformance];
    }

    // Add difficulty level based on test history
    recommendedTests = recommendedTests.map((test) => {
      // Add a difficulty estimation based on average scores or metadata
      const difficulty = test.difficulty || "Orta"; // Default to medium if not specified
      return {
        ...test,
        difficulty,
      };
    });

    res.json(recommendedTests);
  } catch (error) {
    console.error("Önerilen testler alınırken hata:", error);
    res.status(500).json({
      message: "Önerilen testler alınırken bir hata oluştu",
      error: error.message,
    });
  }
});

// Yardımcı fonksiyon: Kalan süreyi hesapla (saniye cinsinden)
function calculateRemainingTime(test) {
  const startTime = new Date(test.startTime);
  const currentTime = new Date();
  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
  const totalSeconds = test.duration * 60; // dakikadan saniyeye çevirme

  return Math.max(0, totalSeconds - elapsedSeconds);
}

module.exports = router;
