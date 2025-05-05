const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

// Test-data klasör yolu
const TEST_DATA_PATH = path.join(__dirname, "../../test-data");
const INTERACTIVE_CONTENTS_PATH = path.join(
  TEST_DATA_PATH,
  "interactive-contents"
);

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

router.get("/subjects", async (req, res) => {
  try {
    const siniflarDir = path.join(TEST_DATA_PATH, "siniflar");
    const siniflar = await fs.readdir(siniflarDir, { withFileTypes: true });

    const subjects = [];
    for (const sinifEntry of siniflar.filter((d) => d.isDirectory())) {
      const sinif = sinifEntry.name;
      const derslerDir = path.join(siniflarDir, sinif);
      const dersler = await fs.readdir(derslerDir, { withFileTypes: true });

      for (const dersEntry of dersler.filter((d) => d.isDirectory())) {
        const ders = dersEntry.name;
        const konularDir = path.join(derslerDir, ders);
        const konular = await fs.readdir(konularDir, { withFileTypes: true });

        for (const konuEntry of konular.filter((d) => d.isDirectory())) {
          const konu = konuEntry.name;
          subjects.push({ sinif, ders, konu });
        }
      }
    }

    res.json(subjects);
  } catch (error) {
    console.error("Subjects endpoint hatası:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Etkileşimli içeriklerin listesini getir
router.get("/interactive-contents", async (req, res) => {
  try {
    const contentsPath = path.join(INTERACTIVE_CONTENTS_PATH, "contents.json");
    const contentsData = await fs.readFile(contentsPath, "utf8");
    const contentsJson = JSON.parse(contentsData);

    // Her içerik için erişim URL'sini ve önizleme resmi URL'sini ekleyin
    const contentsWithUrls = contentsJson.contents.map((content) => ({
      ...content,
      contentUrl: `/api/storage/interactive-contents/${content.id}`,
      previewImageUrl: content.previewImage
        ? `/api/storage/interactive-contents/${content.previewImage}`
        : null,
    }));

    console.log(
      "Generated URLs:",
      contentsWithUrls.map((c) => c.previewImageUrl)
    );

    res.json({ contents: contentsWithUrls });
  } catch (error) {
    console.error("Interactive contents endpoint hatası:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Önizleme resimlerini servis et (yeni yol önerisi kullanılmıyor - static middleware ile sağlanıyor)
// Bu kod artık kullanılmayacak, ancak referans için tutuluyor
router.get("/interactive-contents/images/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(INTERACTIVE_CONTENTS_PATH, filename);
    console.log(
      `Deprecated route - Should use static middleware. Path: ${imagePath}`
    );

    // Redirect to the correct path
    res.redirect(`/api/storage/interactive-contents/${filename}`);
  } catch (error) {
    console.error("Interactive content image endpoint hatası:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

// Belirli bir etkileşimli içeriği getir
router.get("/interactive-contents/:contentId", async (req, res) => {
  try {
    const { contentId } = req.params;
    const contentsPath = path.join(INTERACTIVE_CONTENTS_PATH, "contents.json");
    const contentsData = await fs.readFile(contentsPath, "utf8");
    const contentsJson = JSON.parse(contentsData);

    // İstenilen içeriği bul
    const content = contentsJson.contents.find((item) => item.id === contentId);

    if (!content) {
      return res.status(404).json({ message: "İçerik bulunamadı" });
    }

    // İçeriğin HTML dosyasını oku ve gönder
    const htmlPath = path.join(INTERACTIVE_CONTENTS_PATH, content.filename);
    res.sendFile(htmlPath);
  } catch (error) {
    console.error("Interactive content endpoint hatası:", error);
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
});

module.exports = router;
