const { Events, AuditLogEvent } = require('discord.js');
const { isAuthorized, isProtectionEnabled, handleUnauthorizedAction, sendLog } = require('../utils/guardUtils');

module.exports = {
  name: Events.WebhooksUpdate,
  async execute(channel, client) {
    
    if (!isProtectionEnabled('webhookProtection')) return;
    
    
    const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.WebhookCreate,
    }).catch(err => console.error('Webhook loglarını alırken hata:', err));
    
    if (!fetchedLogs) return;
    
    const webhookLog = fetchedLogs.entries.first();
    if (!webhookLog || webhookLog.createdTimestamp < (Date.now() - 5000)) return;
    
    const { executor } = webhookLog;
    
    
    if (executor.id === client.user.id) return;
    
    try {
      const member = await channel.guild.members.fetch(executor.id).catch(() => null);
      
      
      if (member && isAuthorized(member)) {
        sendLog(
          client, 
          'Webhook Oluşturuldu (İzinli)', 
          `${executor.tag} (${executor.id}) kullanıcısı **${channel.name}** kanalında webhook oluşturdu.`,
          '#FFAA00'
        );
        return;
      }
      
      
      
      const webhooks = await channel.fetchWebhooks();
      
      
      for (const webhook of webhooks.values()) {
        if (webhook.owner && webhook.owner.id === executor.id) {
          await webhook.delete(`KWI Guard: İzinsiz webhook oluşturma`);
        }
      }
      
      sendLog(
        client,
        'Webhook Oluşturuldu (İzinsiz)',
        `${executor.tag} (${executor.id}) kullanıcısı izinsiz olarak **${channel.name}** kanalında webhook oluşturdu.\n\n` +
        '**Alınan Önlem:**\n' +
        `• Webhook silindi.\n` +
        `• Kullanıcı zaman aşımına alındı.`,
        '#FF0000'
      );
      
      if (member) {
        await punishMember(channel.guild, executor.id, 'İzinsiz webhook oluşturma', 'timeout');
      }
      
    } catch (error) {
      console.error('Webhook koruma hatası:', error);
    }
  },
};