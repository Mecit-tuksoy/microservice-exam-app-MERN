const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

// Test-data klasör yolu
const TEST_DATA_PATH = path.join(__dirname, "../../test-data");

// Tüm sınıfları getir
router.get("/classes", async (req, res) => {
  try {
    const siniflarPath = path.join(TEST_DATA_PATH, "siniflar");
    const directories = await fs.readdir(siniflarPath, { withFileTypes: true });
    const classes = directories
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Belirli bir sınıftaki dersleri getir
router.get("/classes/:sinif/dersler", async (req, res) => {
  try {
    const { sinif } = req.params;
    const derslerPath = path.join(TEST_DATA_PATH, "siniflar", sinif);
    const directories = await fs.readdir(derslerPath, { withFileTypes: true });
    const dersler = directories
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    res.json(dersler);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Belirli bir sınıf ve dersin konularını getir
router.get("/classes/:sinif/dersler/:ders/konular", async (req, res) => {
  try {
    const { sinif, ders } = req.params;
    // Varsayalım her dersin altında tek bir alt klasör (ör. "Fen_ve_Teknoloji" için "Yonler" ya da "Matematik" için "Toplama") var.
    const sinifDersPath = path.join(TEST_DATA_PATH, "siniflar", sinif, ders);
    const directories = await fs.readdir(sinifDersPath, {
      withFileTypes: true,
    });
    const konular = directories
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    res.json(konular);
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Belirli bir konu için test verilerini getir
router.get("/test/:sinif/:ders/:konu", async (req, res) => {
  try {
    const { sinif, ders, konu } = req.params;
    const answersPath = path.join(TEST_DATA_PATH, "answers.json");
    const imagesPath = path.join(TEST_DATA_PATH, "siniflar", sinif, ders, konu);

    // answers.json dosyasını oku
    const answersData = await fs.readFile(answersPath, "utf8");
    const answersJson = JSON.parse(answersData);

    // answers.json içinden ilgili sınıf, ders ve konuyu bul
    let konuData = null;
    for (const sinifObj of answersJson.siniflar) {
      if (sinifObj.sinif === sinif) {
        for (const dersObj of sinifObj.dersler) {
          if (dersObj.ders === ders) {
            konuData = dersObj.konular.find((k) => k.konu === konu);
          }
        }
      }
    }
    if (!konuData) {
      return res
        .status(404)
        .json({ message: "Konu cevap anahtarı bulunamadı" });
    }

    // Konu altındaki görsel dosyalarını oku
    const files = await fs.readdir(imagesPath);
    const questionFiles = files.filter(
      (file) =>
        file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg")
    );

    const questions = questionFiles.map((file) => {
      const questionId = file.split(".")[0];
      return {
        questionId,
        imageUrl: `/api/storage/images/${sinif}/${ders}/${konu}/${file}`,
      };
    });

    res.json({
      konu: konuData.konu,
      duration: konuData.duration,
      questions,
      questionCount: questions.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Belirli bir konu için cevapları doğrula
router.post("/validate/:sinif/:ders/:konu", async (req, res) => {
  try {
    const { sinif, ders, konu } = req.params;
    const { answers } = req.body; // { questionId: userAnswer }

    const answersPath = path.join(TEST_DATA_PATH, "answers.json");
    const answersData = await fs.readFile(answersPath, "utf8");
    const answersJson = JSON.parse(answersData);

    let konuData = null;
    for (const sinifObj of answersJson.siniflar) {
      if (sinifObj.sinif === sinif) {
        for (const dersObj of sinifObj.dersler) {
          if (dersObj.ders === ders) {
            konuData = dersObj.konular.find((k) => k.konu === konu);
          }
        }
      }
    }
    if (!konuData) {
      return res
        .status(404)
        .json({ message: "Konu cevap anahtarı bulunamadı" });
    }

    const questionKeys = Object.keys(konuData.questions);
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;
    const details = [];

    questionKeys.forEach((questionId, index) => {
      const correctAnswer = konuData.questions[questionId];
      const userAnswer =
        answers[questionId] !== undefined ? answers[questionId] : "";
      const status =
        userAnswer === ""
          ? "empty"
          : parseInt(userAnswer) === correctAnswer
          ? "correct"
          : "wrong";
      details.push({
        questionNo: index + 1,
        status,
        userAnswer,
        correctAnswer,
      });
      if (userAnswer === "") {
        emptyCount++;
      } else if (parseInt(userAnswer) === correctAnswer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const netScore = correctCount - wrongCount / 3;
    res.json({
      konu: konuData.konu,
      totalQuestions: questionKeys.length,
      correctCount,
      wrongCount,
      emptyCount,
      netScore: parseFloat(netScore.toFixed(2)),
      details,
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

router.get("/images/:sinif/:ders/:konu/:file", async (req, res) => {
  try {
    const { sinif, ders, konu, file } = req.params;
    const imagePath = path.join(
      __dirname,
      "../../test-data/siniflar",
      sinif,
      ders,
      konu,
      file
    );
    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({
      message: "Görsel yüklenirken hata oluştu",
      error: error.message,
    });
  }
});

module.exports = router;
