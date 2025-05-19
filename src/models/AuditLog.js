const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'ROLE_CREATE', 'ROLE_DELETE', 'ROLE_UPDATE',
      'CHANNEL_CREATE', 'CHANNEL_DELETE', 'CHANNEL_UPDATE',
      'GUILD_UPDATE', 'MEMBER_BAN', 'MEMBER_UNBAN',
      'MEMBER_KICK', 'BOT_ADD', 'WEBHOOK_CREATE',
      'WEBHOOK_UPDATE', 'WEBHOOK_DELETE', 'RAID_DETECTED',
      'SPAM_DETECTED', 'AD_DETECTED', 'PERMISSION_CHANGE',
      'UNAUTHORIZED_ACTION', 'AUTHORIZED_ACTION', 'SYSTEM_ACTION'
    ]
  },
  performedBy: {
    userId: String,
    tag: String
  },
  target: {
    id: String,      
    name: String,     
    type: String      
  },
  details: {
    type: mongoose.Schema.Types.Mixed, 
    default: {}
  },
  prevented: {
    type: Boolean,
    default: false
  },
  actionTaken: {
    type: String,
    enum: ['none', 'revert', 'ban', 'kick', 'timeout', 'other', 'warn'],
    default: 'none'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});


AuditLogSchema.index({ guildId: 1, timestamp: -1 });
AuditLogSchema.index({ guildId: 1, actionType: 1 });
AuditLogSchema.index({ 'performedBy.userId': 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);