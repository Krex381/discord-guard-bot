const { Events, AuditLogEvent } = require('discord.js');
const { isAuthorized, isProtectionEnabled, handleUnauthorizedAction, sendLog } = require('../utils/guardUtils');

module.exports = {
  name: Events.GuildIntegrationsUpdate,
  async execute(guild, client) {
    
    if (!isProtectionEnabled('webhookProtection')) return;
    
    
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.IntegrationCreate,
    }).catch(err => console.error('Entegrasyon loglarını alırken hata:', err));
    
    if (!fetchedLogs) return;
    
    const integrationLog = fetchedLogs.entries.first();
    if (!integrationLog || integrationLog.createdTimestamp < (Date.now() - 5000)) return;
    
    const { executor } = integrationLog;
    
    
    if (executor.id === client.user.id) return;
    
    try {
      const member = await guild.members.fetch(executor.id).catch(() => null);
      
      
      if (member && isAuthorized(member)) {
        sendLog(
          client, 
          'Entegrasyon Eklendi (İzinli)', 
          `${executor.tag} (${executor.id}) kullanıcısı sunucuya yeni bir entegrasyon ekledi.`,
          '#FFAA00'
        );
        return;
      }
      
      
      const reason = 'İzinsiz entegrasyon ekleme';
      
      
      const result = await handleUnauthorizedAction(client, guild, executor, reason, 'integration');
      
      
      if (!result.punished) {
        sendLog(
          client,
          'Entegrasyon Eklendi (İzinsiz)',
          `${executor.tag} (${executor.id}) kullanıcısı izinsiz olarak sunucuya entegrasyon eklemeye çalıştı.\n\n` +
          '**Alınan Önlem:**\n' +
          `• Kullanıcı uyarıldı (${result.offenseCount}/3).\n` +
          `• **NOT:** Entegrasyonu manuel olarak kaldırmanız gerekebilir.`,
          '#FF0000'
        );
      }
      
    } catch (error) {
      console.error('Entegrasyon koruma hatası:', error);
    }
  },
};