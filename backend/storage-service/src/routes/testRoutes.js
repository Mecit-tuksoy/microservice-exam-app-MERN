// storage-service/src/routes/testRoutes.js
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Test-data klasör yolu
const TEST_DATA_PATH = path.join(__dirname, '../../test-data');

// Mevcut tüm konu başlıklarını getir
router.get('/subjects', async (req, res) => {
  try {
    const answersPath = path.join(TEST_DATA_PATH, 'answers.json');
    const imagesPath = path.join(TEST_DATA_PATH, 'images');
    
    // answers.json dosyasını oku
    const answersData = await fs.readFile(answersPath, 'utf8');
    const answers = JSON.parse(answersData);
    
    // Klasörleri kontrol et
    const directories = await fs.readdir(imagesPath, { withFileTypes: true });
    const subjects = directories
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Answers.json'daki konularla klasörleri eşleştir
    const availableSubjects = [];
    
    if (Array.isArray(answers)) {
      // Eğer answers.json bir dizi ise
      for (const subject of answers) {
        if (subjects.includes(subject.subject)) {
          availableSubjects.push({
            subject: subject.subject,
            duration: subject.duration
          });
        }
      }
    } else {
      // Eğer answers.json tek bir nesne ise
      if (subjects.includes(answers.subject)) {
        availableSubjects.push({
          subject: answers.subject,
          duration: answers.duration
        });
      }
    }
    
    res.json(availableSubjects);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Belirli bir konu için test verilerini getir
router.get('/test/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const answersPath = path.join(TEST_DATA_PATH, 'answers.json');
    const subjectPath = path.join(TEST_DATA_PATH, 'images', subject);
    
    // Klasörün varlığını kontrol et
    try {
      await fs.access(subjectPath);
    } catch (error) {
      return res.status(404).json({ message: 'Konu bulunamadı' });
    }
    
    // answers.json dosyasını oku
    const answersData = await fs.readFile(answersPath, 'utf8');
    let answers = JSON.parse(answersData);
    
    // Doğru konu bilgilerini al
    let subjectData = null;
    
    if (Array.isArray(answers)) {
      // Eğer answers.json bir dizi ise
      subjectData = answers.find(item => item.subject === subject);
    } else {
      // Eğer answers.json tek bir nesne ise
      if (answers.subject === subject) {
        subjectData = answers;
      }
    }
    
    if (!subjectData) {
      return res.status(404).json({ message: 'Konu cevap anahtarı bulunamadı' });
    }
    
    // Soruları listele
    const files = await fs.readdir(subjectPath);
    const questionFiles = files.filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
    );
    
    // Her soru için URL oluştur
    const questions = questionFiles.map(file => {
      const answer = subjectData.questions[file.split('.')[0]] || null;
      return {
        questionId: file.split('.')[0],
        imageUrl: `/api/storage/images/${subject}/${file}`,
        // Cevap anahtarını sadece backend'de tut, istemciye gönderme
      };
    });
    
    res.json({
      subject: subjectData.subject,
      duration: subjectData.duration,
      questions: questions,
      questionCount: questions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// Test sonuçlarını doğrula
router.post('/validate/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const { answers } = req.body; // { questionId: userAnswer } şeklinde
    
    const answersPath = path.join(TEST_DATA_PATH, 'answers.json');
    
    // answers.json dosyasını oku
    const answersData = await fs.readFile(answersPath, 'utf8');
    let answerKey = JSON.parse(answersData);
    
    // Doğru konu bilgilerini al
    let subjectData = null;
    
    if (Array.isArray(answerKey)) {
      // Eğer answers.json bir dizi ise
      subjectData = answerKey.find(item => item.subject === subject);
    } else {
      // Eğer answers.json tek bir nesne ise
      if (answerKey.subject === subject) {
        subjectData = answerKey;
      }
    }
    
    if (!subjectData) {
      return res.status(404).json({ message: 'Konu cevap anahtarı bulunamadı' });
    }
    
    // Sonuçları hesapla
    const questionKeys = Object.keys(subjectData.questions);
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;
    const details = [];

    questionKeys.forEach((questionId, index) => {
      const correctAnswer = subjectData.questions[questionId];
      const userAnswer = answers[questionId] !== undefined ? answers[questionId] : "";
    
      details.push({
        questionNo: index + 1,  
        status: userAnswer === "" ? 'empty' : (parseInt(userAnswer) === correctAnswer ? 'correct' : 'wrong'),
        userAnswer,
        correctAnswer
      });
    
      if (userAnswer === "") {
        emptyCount++;
      } else if (parseInt(userAnswer) === correctAnswer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });
    
    // Net hesapla (3 yanlış 1 doğruyu götürür)
    const netScore = correctCount - (wrongCount / 3);
    
    res.json({
      subject,
      totalQuestions: questionKeys.length,
      correctCount,
      wrongCount,
      emptyCount,
      netScore: parseFloat(netScore.toFixed(2)),
      details
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router;