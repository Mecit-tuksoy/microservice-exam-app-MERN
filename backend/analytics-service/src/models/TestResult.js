// analytics-service/src/models/TestResult.js
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
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
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
  }
});

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;