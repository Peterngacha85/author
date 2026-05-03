const mongoose = require('mongoose');

const TrafficSchema = new mongoose.Schema({
  ip: String,
  userAgent: String,
  path: String,
  referrer: String,
  country: String,
  city: String,
  browser: String,
  os: String,
  device: String,
  sessionId: String,
  isConversion: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Traffic', TrafficSchema);
