const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');
const { isAuthorized, isProtectionEnabled, handleUnauthorizedAction, sendLog } = require('../utils/guardUtils');

module.exports = {
  name: Events.GuildRoleCreate,
  async execute(role, client) {
    
    if (!isProtectionEnabled('roleProtection')) return;
    
    const { guild } = role;
    
    
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleCreate,
    }).catch(err => console.error('Rol oluşturma loglarını alırken hata:', err));
    
    if (!fetchedLogs) return;
    
    const creationLog = fetchedLogs.entries.first();
    
    
    if (!creationLog || creationLog.createdTimestamp < (Date.now() - 5000)) return;
    
    const { executor } = creationLog;
    
    
    if (executor.id === client.user.id) return;
    
    try {
      const member = await guild.members.fetch(executor.id);
      
      
      const dangerousPerms = role.permissions.has([
        PermissionsBitField.Flags.Administrator,
        PermissionsBitField.Flags.ManageGuild,
        PermissionsBitField.Flags.BanMembers,
        PermissionsBitField.Flags.KickMembers,
        PermissionsBitField.Flags.ManageRoles,
        PermissionsBitField.Flags.ManageChannels,
        PermissionsBitField.Flags.ManageWebhooks
      ]);
      
      
      if (isAuthorized(member)) {
        if (dangerousPerms) {
          sendLog(
            client,
            'Yüksek İzinli Rol Oluşturuldu',
            `${executor.tag} (${executor.id}) kullanıcısı tehlikeli izinlere sahip **${role.name}** rolünü oluşturdu.\n\n` +
            `**İzinler:**\n` +
            `• Administrator: ${role.permissions.has(PermissionsBitField.Flags.Administrator) ? '✅' : '❌'}\n` +
            `• Sunucu Yönetme: ${role.permissions.has(PermissionsBitField.Flags.ManageGuild) ? '✅' : '❌'}\n` +
            `• Ban Atma: ${role.permissions.has(PermissionsBitField.Flags.BanMembers) ? '✅' : '❌'}\n` +
            `• Kick Atma: ${role.permissions.has(PermissionsBitField.Flags.KickMembers) ? '✅' : '❌'}\n` +
            `• Rol Yönetme: ${role.permissions.has(PermissionsBitField.Flags.ManageRoles) ? '✅' : '❌'}`,
            '#FFAA00'
          );
        } else {
          
          sendLog(
            client, 
            'Rol Oluşturuldu (İzinli)', 
            `${executor.tag} (${executor.id}) kullanıcısı **${role.name}** rolünü oluşturdu.`,
            '#00FF00'
          );
        }
        return;
      }
      
      
      const reason = 'İzinsiz rol oluşturma';
      
      
      await role.delete('KWI Guard: ' + reason);
      
      
      const result = await handleUnauthorizedAction(client, guild, executor, reason, 'ban');
      
      
      if (!result.punished) {
        sendLog(
          client,
          'Rol Oluşturuldu (İzinsiz)',
          `${executor.tag} (${executor.id}) kullanıcısı izinsiz olarak **${role.name}** rolünü oluşturdu.\n\n` +
          '**Alınan Önlem:**\n' +
          `• Oluşturulan rol silindi.\n` +
          `• Kullanıcı uyarıldı (${result.offenseCount}/3).`,
          '#FF0000'
        );
      }
      
    } catch (error) {
      console.error('Rol oluşturma koruma hatası:', error);
    }
  },
};