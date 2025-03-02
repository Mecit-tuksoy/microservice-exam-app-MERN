const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  wrongAnswers: {
    type: Number,
    required: true
  },
  emptyAnswers: {
    type: Number,
    required: true
  },
  netScore: {
    type: Number,
    required: true
  },
  rank: {
    type: Number
  },
  totalParticipants: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Kullanıcının cevapları ve doğru cevaplar eklendi
  userAnswers: {
    type: Map,
    of: String
  },
  correctAnswerMap: {
    type: Map,
    of: String
  }
});

module.exports = mongoose.model('TestResult', testResultSchema);