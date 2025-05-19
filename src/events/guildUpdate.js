const { Events, AuditLogEvent } = require('discord.js');
const { isAuthorized, isProtectionEnabled, handleUnauthorizedAction, sendLog } = require('../utils/guardUtils');

module.exports = {
  name: Events.GuildUpdate,
  async execute(oldGuild, newGuild, client) {
    
    if (!isProtectionEnabled('guildUpdateProtection')) return;
    
    
    const fetchedLogs = await newGuild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.GuildUpdate,
    }).catch(err => console.error('Sunucu güncelleme loglarını alırken hata:', err));
    
    if (!fetchedLogs) return;
    
    const updateLog = fetchedLogs.entries.first();
    if (!updateLog) return;
    
    const { executor } = updateLog;
    
    
    if (executor.id === client.user.id) return;
    
    try {
      const member = await newGuild.members.fetch(executor.id);
      
      
      if (isAuthorized(member)) {
        
        const changes = [];
        
        if (oldGuild.name !== newGuild.name) {
          changes.push(`Sunucu İsmi: '${oldGuild.name}' -> '${newGuild.name}'`);
        }
        
        if (oldGuild.iconURL() !== newGuild.iconURL()) {
          changes.push(`Sunucu İkonu değiştirildi`);
        }
        
        if (oldGuild.bannerURL() !== newGuild.bannerURL()) {
          changes.push(`Sunucu Bannerı değiştirildi`);
        }
        
        if (changes.length > 0) {
          sendLog(
            client, 
            'Sunucu Güncellendi (İzinli)', 
            `${executor.tag} (${executor.id}) kullanıcısı sunucu ayarlarını değiştirdi.\n\n**Yapılan Değişiklikler:**\n${changes.map(c => '• ' + c).join('\n')}`,
            '#FFAA00'
          );
        }
        return;
      }
      
      
      const reason = 'İzinsiz sunucu ayarı değiştirme';
      
      
      const revertedChanges = [];
      
      
      if (oldGuild.name !== newGuild.name) {
        await newGuild.setName(oldGuild.name, 'KWI Guard: İzinsiz isim değişikliği geri alındı');
        revertedChanges.push(`Sunucu İsmi: '${newGuild.name}' -> '${oldGuild.name}'`);
      }
      
      
      if (oldGuild.iconURL() !== newGuild.iconURL()) {
        await newGuild.setIcon(oldGuild.iconURL(), 'KWI Guard: İzinsiz ikon değişikliği geri alındı');
        revertedChanges.push('Sunucu İkonu geri yüklendi');
      }
      
      
      if (oldGuild.bannerURL() !== newGuild.bannerURL()) {
        await newGuild.setBanner(oldGuild.bannerURL(), 'KWI Guard: İzinsiz banner değişikliği geri alındı');
        revertedChanges.push('Sunucu Bannerı geri yüklendi');
      }
      
      if (revertedChanges.length > 0) {
        
        const result = await handleUnauthorizedAction(client, newGuild, executor, reason, 'kick');
        
        
        if (!result.punished) {
          sendLog(
            client,
            'Sunucu Güncellendi (İzinsiz)',
            `${executor.tag} (${executor.id}) kullanıcısı izinsiz olarak sunucu ayarlarını değiştirdi.\n\n` +
            '**Alınan Önlem:**\n' +
            `• Kullanıcı uyarıldı (${result.offenseCount}/3).\n` +
            `• Değişiklikler geri alındı:\n${revertedChanges.map(c => '  - ' + c).join('\n')}`,
            '#FF0000'
          );
        }
      }
      
    } catch (error) {
      console.error('Sunucu koruma hatası:', error);
    }
  },
};