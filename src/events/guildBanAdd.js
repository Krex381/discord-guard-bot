const { Events, AuditLogEvent } = require('discord.js');
const { isAuthorized, isProtectionEnabled, handleUnauthorizedAction, sendLog } = require('../utils/guardUtils');

module.exports = {
  name: Events.GuildBanAdd,
  async execute(ban, client) {
    
    if (!isProtectionEnabled('banKickProtection')) return;
    
    const guild = ban.guild;
    const user = ban.user;
    
    
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    }).catch(err => console.error('Ban loglarını alırken hata:', err));
    
    if (!fetchedLogs) return;
    
    const banLog = fetchedLogs.entries.first();
    if (!banLog) return;
    
    const { executor } = banLog;
    
    
    if (executor.id === client.user.id) return;
    
    try {
      const member = await guild.members.fetch(executor.id).catch(() => null);
      
      
      if (member && isAuthorized(member)) {
        sendLog(
          client, 
          'Kullanıcı Yasaklandı (İzinli)', 
          `${executor.tag} (${executor.id}) kullanıcısı **${user.tag}** (${user.id}) kullanıcısını sunucudan yasakladı.\n\n**Sebep:** ${banLog.reason || 'Belirtilmemiş'}`,
          '#FFAA00'
        );
        return;
      }
      
      
      await guild.members.unban(user.id, 'KWI Guard: İzinsiz yasaklama geri alındı');
      
      
      const reason = 'İzinsiz kullanıcı yasaklama';
      
      
      const result = await handleUnauthorizedAction(client, guild, executor, reason, 'ban');
      
      
      if (!result.punished) {
        sendLog(
          client,
          'Kullanıcı Yasaklandı (İzinsiz)',
          `${executor.tag} (${executor.id}) kullanıcısı izinsiz olarak **${user.tag}** (${user.id}) kullanıcısını sunucudan yasakladı.\n\n` +
          '**Alınan Önlem:**\n' +
          `• Kullanıcı uyarıldı (${result.offenseCount}/3).\n` +
          `• Yasaklanan kullanıcının yasağı kaldırıldı.`,
          '#FF0000'
        );
      }
      
    } catch (error) {
      console.error('Ban koruma hatası:', error);
    }
  },
};