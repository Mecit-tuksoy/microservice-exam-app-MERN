const mongoose = require('mongoose');

const activeTestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    required: true
  },
  answers: {
    type: Map,
    of: Number,
    default: {}
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const ActiveTest = mongoose.model('ActiveTest', activeTestSchema);

module.exports = ActiveTest;