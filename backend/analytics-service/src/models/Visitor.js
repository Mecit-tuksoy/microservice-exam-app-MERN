// analytics-service/src/models/Visitor.js
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  count: {
    type: Number,
    default: 0,
    required: true
  }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;