const mongoose = require('mongoose');

const ServerSettingsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  logChannelId: {
    type: String,
    default: null
  },
  whitelist: {
    type: [String],
    default: []
  },
  guardSettings: {
    roleProtection: {
      type: Boolean,
      default: true
    },
    channelProtection: {
      type: Boolean,
      default: true
    },
    emojiProtection: {
      type: Boolean,
      default: true
    },
    guildUpdateProtection: {
      type: Boolean,
      default: true
    },
    banKickProtection: {
      type: Boolean,
      default: true
    },
    botAddProtection: {
      type: Boolean,
      default: true
    },
    webhookProtection: {
      type: Boolean,
      default: true
    },
    roleDistributionProtection: {
      type: Boolean,
      default: true
    },
    raidProtection: {
      type: Boolean,
      default: true
    },
    everyoneHereProtection: {
      type: Boolean,
      default: true
    },
    spamProtection: {
      type: Boolean,
      default: true
    },
    adBlockProtection: {
      type: Boolean,
      default: true
    }
  },
  backupData: {
    roles: {
      type: Array,
      default: []
    },
    channels: {
      type: Array,
      default: []
    },
    emojis: {
      type: Array, 
      default: []
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


ServerSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ServerSettings', ServerSettingsSchema);