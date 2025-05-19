const { Events, AuditLogEvent } = require('discord.js');
const { isAuthorized, isProtectionEnabled, handleUnauthorizedAction, sendLog } = require('../utils/guardUtils');

module.exports = {
  name: Events.GuildRoleDelete,
  async execute(role, client) {
    
    if (!isProtectionEnabled('roleProtection')) return;
    
    
    const fetchedLogs = await role.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleDelete,
    }).catch(err => console.error('Rol silme loglarını alırken hata:', err));
    
    if (!fetchedLogs) return;
    
    const deletionLog = fetchedLogs.entries.first();
    if (!deletionLog) return;
    
    const { executor } = deletionLog;
    
    
    if (executor.id === client.user.id) return;
    
    try {
      const member = await role.guild.members.fetch(executor.id);
      
      
      if (isAuthorized(member)) {
        sendLog(client, 'Rol Silindi (İzinli)', `${executor.tag} (${executor.id}) kullanıcısı **${role.name}** rolünü sildi.`, '#FFAA00');
        return;
      }
      
      
      const reason = 'İzinsiz rol silme';
      
      
      const newRole = await role.guild.roles.create({
        name: role.name,
        color: role.color,
        hoist: role.hoist,
        position: role.position,
        permissions: role.permissions,
        mentionable: role.mentionable,
        reason: 'KWI Guard: Silinen rol geri oluşturuldu'
      });
      
      
      const result = await handleUnauthorizedAction(client, role.guild, executor, reason, 'ban');
      
      
      if (!result.punished) {
        sendLog(
          client,
          'Rol Silindi (İzinsiz)',
          `${executor.tag} (${executor.id}) kullanıcısı **${role.name}** rolünü izinsiz sildi.\n\n` +
          '**Alınan Önlem:**\n' +
          `• Silinen rol geri oluşturuldu.\n` +
          `• Kullanıcı uyarıldı (${result.offenseCount}/3).`,
          '#FF0000'
        );
      }
      
    } catch (error) {
      console.error('Rol koruma hatası:', error);
    }
  },
};