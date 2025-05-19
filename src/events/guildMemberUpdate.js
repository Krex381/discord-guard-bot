const { Events, AuditLogEvent, PermissionsBitField } = require('discord.js');
const { isAuthorized, isProtectionEnabled, punishMember, sendLog } = require('../utils/guardUtils');

module.exports = {
  name: Events.GuildMemberUpdate,
  async execute(oldMember, newMember, client) {
    
    if (!isProtectionEnabled('roleDistributionProtection')) return;
    
    const { guild } = newMember;
    
    
    const oldRoles = [...oldMember.roles.cache.keys()];
    const newRoles = [...newMember.roles.cache.keys()];
    
    
    const addedRoles = newRoles.filter(role => !oldRoles.includes(role));
    
    
    if (addedRoles.length === 0) return;
    
    
    const fetchedLogs = await guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberRoleUpdate,
    }).catch(err => console.error('Üye rol güncelleme loglarını alırken hata:', err));
    
    if (!fetchedLogs) return;
    
    const roleUpdateLog = fetchedLogs.entries.first();
    if (!roleUpdateLog || roleUpdateLog.target.id !== newMember.id) return;
    
    const { executor } = roleUpdateLog;
    
    
    if (executor.id === client.user.id) return;
    
    try {
      const executorMember = await guild.members.fetch(executor.id);
      
      
      const dangerousRoles = [];
      let dangerousRoleAdded = false;
      
      for (const roleId of addedRoles) {
        const role = guild.roles.cache.get(roleId);
        if (!role) continue;
        
        
        if (role.permissions.has([
          PermissionsBitField.Flags.Administrator,
          PermissionsBitField.Flags.ManageGuild,
          PermissionsBitField.Flags.BanMembers,
          PermissionsBitField.Flags.KickMembers,
          PermissionsBitField.Flags.ManageRoles,
          PermissionsBitField.Flags.ManageChannels
        ])) {
          dangerousRoles.push(role);
          dangerousRoleAdded = true;
        }
      }
      
      
      if (isAuthorized(executorMember)) {
        if (dangerousRoleAdded) {
          
          const rolesList = dangerousRoles.map(role => `• ${role.name}`).join('\n');
          
          sendLog(
            client,
            'Güçlü Rol Verildi',
            `${executor.tag} (${executor.id}) kullanıcısı ${newMember.user.tag} (${newMember.id}) kullanıcısına yüksek izinli roller verdi.\n\n` +
            `**Verilen Tehlikeli Roller:**\n${rolesList}`,
            '#FFAA00'
          );
        }
        return;
      }
      
      
      
      const removedRoleNames = [];
      
      
      for (const roleId of addedRoles) {
        const role = guild.roles.cache.get(roleId);
        if (!role) continue;
        
        try {
          
          await newMember.roles.remove(role, 'KWI Guard: İzinsiz rol verme işlemi geri alındı');
          removedRoleNames.push(role.name);
        } catch (error) {
          console.error(`${role.name} rolünü geri alırken hata:`, error);
        }
      }
      
      
      const punishmentType = dangerousRoleAdded ? 'ban' : 'timeout';
      
      sendLog(
        client,
        'İzinsiz Rol Verildi',
        `${executor.tag} (${executor.id}) kullanıcısı izinsiz olarak ${newMember.user.tag} (${newMember.id}) kullanıcısına roller vermeye çalıştı.\n\n` +
        `**Verilen Roller:**\n${removedRoleNames.map(name => `• ${name}`).join('\n')}\n\n` +
        '**Alınan Önlem:**\n' +
        `• Verilen roller geri alındı.\n` +
        `• ${punishmentType === 'ban' ? 'Kullanıcı sunucudan yasaklandı.' : 'Kullanıcı zaman aşımına alındı.'}`,
        '#FF0000'
      );
      
      
      await punishMember(guild, executor.id, 'İzinsiz rol verme', punishmentType);
      
    } catch (error) {
      console.error('Rol verme koruma hatası:', error);
    }
  },
};