const mongoose = require('mongoose');

const UserOffenseSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  offenseType: {
    type: String,
    required: true,
    enum: ['spam', 'ad', 'raid', 'unauthorized_action', 'other']
  },
  offenseCount: {
    type: Number,
    default: 1
  },
  lastOffenseTime: {
    type: Date,
    default: Date.now
  },
  punishments: [{
    type: {
      type: String,
      enum: ['warn', 'mute', 'timeout', 'kick', 'ban']
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    duration: Number, 
    moderatorId: String
  }]
});


UserOffenseSchema.index({ guildId: 1, userId: 1, offenseType: 1 });

module.exports = mongoose.model('UserOffense', UserOffenseSchema);