const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');
const { isAuthorized, isProtectionEnabled, handleUnauthorizedAction, sendLog } = require('../utils/guardUtils');


const processedAuditLogs = new Set();

module.exports = {
  name: Events.GuildRoleUpdate,
  async execute(oldRole, newRole, client) {
    
    if (!isProtectionEnabled('roleProtection')) return;
    
    const { guild } = newRole;
    
    
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.RoleUpdate,
    }).catch(err => console.error('Rol güncelleme loglarını alırken hata:', err));
    
    if (!fetchedLogs) return;
    
    const updateLog = fetchedLogs.entries.first();
    
    
    if (!updateLog || updateLog.createdTimestamp < (Date.now() - 5000)) return;
    
    
    const auditLogId = updateLog.id;
    if (processedAuditLogs.has(auditLogId)) return;
    
    
    processedAuditLogs.add(auditLogId);
    if (processedAuditLogs.size > 100) {
      const iterator = processedAuditLogs.values();
      processedAuditLogs.delete(iterator.next().value);
    }
    
    const { executor } = updateLog;
    
    
    if (executor.id === client.user.id) return;
    
    try {
      const member = await guild.members.fetch(executor.id);
      
      
      const nameChanged = oldRole.name !== newRole.name;
      const colorChanged = oldRole.color !== newRole.color;
      const hoistChanged = oldRole.hoist !== newRole.hoist;
      const mentionableChanged = oldRole.mentionable !== newRole.mentionable;
      const positionChanged = oldRole.position !== newRole.position;
      
      
      const oldHasAdmin = oldRole.permissions.has(PermissionsBitField.Flags.Administrator);
      const newHasAdmin = newRole.permissions.has(PermissionsBitField.Flags.Administrator);
      
      
      const dangerousPermsAdded = !oldHasAdmin && newHasAdmin;
      
      
      const dangerousPermissionFlags = [
        PermissionsBitField.Flags.Administrator,
        PermissionsBitField.Flags.ManageGuild,
        PermissionsBitField.Flags.BanMembers,
        PermissionsBitField.Flags.KickMembers,
        PermissionsBitField.Flags.ManageRoles,
        PermissionsBitField.Flags.ManageChannels,
        PermissionsBitField.Flags.ManageWebhooks
      ];
      
      const newlyAddedDangerousPermissions = dangerousPermissionFlags.filter(
        perm => !oldRole.permissions.has(perm) && newRole.permissions.has(perm)
      );
      
      const permissionsChanged = newlyAddedDangerousPermissions.length > 0 || 
        !oldRole.permissions.equals(newRole.permissions);
      
      
      if (!nameChanged && !colorChanged && !hoistChanged && !mentionableChanged && 
          !positionChanged && !permissionsChanged) {
        return;
      }
      
      
      if (isAuthorized(member)) {
        
        if (newlyAddedDangerousPermissions.length > 0) {
          const permNames = {
            [PermissionsBitField.Flags.Administrator]: 'Administrator (Yönetici)',
            [PermissionsBitField.Flags.ManageGuild]: 'Manage Guild (Sunucu Yönetme)',
            [PermissionsBitField.Flags.BanMembers]: 'Ban Members (Ban Atma)',
            [PermissionsBitField.Flags.KickMembers]: 'Kick Members (Kick Atma)',
            [PermissionsBitField.Flags.ManageRoles]: 'Manage Roles (Rol Yönetme)',
            [PermissionsBitField.Flags.ManageChannels]: 'Manage Channels (Kanal Yönetme)',
            [PermissionsBitField.Flags.ManageWebhooks]: 'Manage Webhooks (Webhook Yönetme)'
          };
          
          const addedPermsList = newlyAddedDangerousPermissions.map(
            perm => `• ${permNames[perm] || 'Bilinmeyen İzin'}`
          ).join('\n');
          
          sendLog(
            client,
            'Tehlikeli Rol İzni Eklendi (İzinli)',
            `${executor.tag} (${executor.id}) kullanıcısı **${newRole.name}** rolüne tehlikeli izinler ekledi.\n\n` +
            `**Eklenen İzinler:**\n${addedPermsList}`,
            '#FFAA00'
          );
        } else if (nameChanged || colorChanged || hoistChanged || mentionableChanged) {
          
          
          let changes = [];
          if (nameChanged) changes.push(`İsim: ${oldRole.name} → ${newRole.name}`);
          if (colorChanged) changes.push(`Renk değiştirildi`);
          if (hoistChanged) changes.push(`Görünürlük değiştirildi`);
          if (mentionableChanged) changes.push(`Etiketlenebilirlik değiştirildi`);
          
          sendLog(
            client, 
            'Rol Güncellendi (İzinli)', 
            `${executor.tag} (${executor.id}) kullanıcısı **${newRole.name}** rolünü güncelledi.\n\n` +
            `**Değişiklikler:**\n• ${changes.join('\n• ')}`,
            '#00FF00'
          );
        }
        return;
      }
      
      let reason = 'İzinsiz rol güncellemesi';
      let changes = [];
      
      
      if (newlyAddedDangerousPermissions.length > 0) {
        
        reason = 'İzinsiz tehlikeli rol izni ekleme';
        
        
        await newRole.setPermissions(oldRole.permissions);
        
        
        const permNames = {
          [PermissionsBitField.Flags.Administrator]: 'Administrator (Yönetici)',
          [PermissionsBitField.Flags.ManageGuild]: 'Manage Guild (Sunucu Yönetme)',
          [PermissionsBitField.Flags.BanMembers]: 'Ban Members (Ban Atma)',
          [PermissionsBitField.Flags.KickMembers]: 'Kick Members (Kick Atma)',
          [PermissionsBitField.Flags.ManageRoles]: 'Manage Roles (Rol Yönetme)',
          [PermissionsBitField.Flags.ManageChannels]: 'Manage Channels (Kanal Yönetme)',
          [PermissionsBitField.Flags.ManageWebhooks]: 'Manage Webhooks (Webhook Yönetme)'
        };
        
        const addedPermsList = newlyAddedDangerousPermissions.map(
          perm => `• ${permNames[perm] || 'Bilinmeyen İzin'}`
        ).join('\n');
        
        changes.push(`Tehlikeli izinler: ${addedPermsList}`);
        
        
        const result = await handleUnauthorizedAction(client, guild, executor, reason, 'ban');
        
        
        if (!result.punished) {
          sendLog(
            client,
            'Tehlikeli Rol İzni Eklendi (İzinsiz)',
            `${executor.tag} (${executor.id}) kullanıcısı izinsiz olarak **${newRole.name}** rolüne tehlikeli izinler eklemeye çalıştı.\n\n` +
            `**Eklenmeye Çalışılan İzinler:**\n${addedPermsList}\n\n` +
            '**Alınan Önlem:**\n' +
            `• Rol izinleri eski haline geri döndürüldü.\n` +
            `• Kullanıcı uyarıldı (${result.offenseCount}/3).`,
            '#FF0000'
          );
        }
      } 
      
      else if (nameChanged || colorChanged || hoistChanged || mentionableChanged || permissionsChanged) {
        
        await newRole.edit({
          name: oldRole.name,
          color: oldRole.color,
          hoist: oldRole.hoist,
          mentionable: oldRole.mentionable,
          permissions: oldRole.permissions
          
        }, 'KWI Guard: İzinsiz rol değişikliği geri alındı');
        
        if (nameChanged) changes.push(`İsim: ${oldRole.name} → ${newRole.name}`);
        if (colorChanged) changes.push(`Renk değiştirildi`);
        if (hoistChanged) changes.push(`Görünürlük değiştirildi`);
        if (mentionableChanged) changes.push(`Etiketlenebilirlik değiştirildi`);
        if (permissionsChanged) changes.push(`İzinler değiştirildi`);
        
        
        const result = await handleUnauthorizedAction(client, guild, executor, reason, 'timeout');
        
        
        if (!result.punished) {
          sendLog(
            client,
            'Rol Güncellendi (İzinsiz)',
            `${executor.tag} (${executor.id}) kullanıcısı izinsiz olarak **${oldRole.name}** rolünü güncelledi.\n\n` +
            `**Yapılan Değişiklikler:**\n• ${changes.join('\n• ')}\n\n` +
            '**Alınan Önlem:**\n' +
            `• Rol ayarları eski haline geri döndürüldü.\n` +
            `• Kullanıcı uyarıldı (${result.offenseCount}/3).`,
            '#FF0000'
          );
        }
      }
      
    } catch (error) {
      console.error('Rol güncelleme koruma hatası:', error);
    }
  },
};