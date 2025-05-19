const { Events, AuditLogEvent, ChannelType } = require('discord.js');
const { isAuthorized, isProtectionEnabled, handleUnauthorizedAction, sendLog } = require('../utils/guardUtils');

module.exports = {
  name: Events.ChannelDelete,
  async execute(channel, client) {
    
    if (!isProtectionEnabled('channelProtection')) return;
    
    
    const fetchedLogs = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete,
    }).catch(err => console.error('Kanal silme loglarını alırken hata:', err));
    
    if (!fetchedLogs) return;
    
    const deletionLog = fetchedLogs.entries.first();
    if (!deletionLog) return;
    
    const { executor } = deletionLog;
    
    
    if (executor.id === client.user.id) return;
    
    try {
      const member = await channel.guild.members.fetch(executor.id);
      
      
      if (isAuthorized(member)) {
        sendLog(client, 'Kanal Silindi (İzinli)', `${executor.tag} (${executor.id}) kullanıcısı **${channel.name}** kanalını sildi.`, '#FFAA00');
        return;
      }
      
      
      const reason = 'İzinsiz kanal silme';
      
      
      let newChannel;
      
      if (channel.type === ChannelType.GuildText) {
        newChannel = await channel.guild.channels.create({
          name: channel.name,
          type: ChannelType.GuildText,
          topic: channel.topic,
          nsfw: channel.nsfw,
          parent: channel.parent,
          permissionOverwrites: channel.permissionOverwrites.cache.toJSON(),
          position: channel.position,
          reason: 'KWI Guard: Silinen kanal geri oluşturuldu'
        });
      } else if (channel.type === ChannelType.GuildVoice) {
        newChannel = await channel.guild.channels.create({
          name: channel.name,
          type: ChannelType.GuildVoice,
          bitrate: channel.bitrate,
          userLimit: channel.userLimit,
          parent: channel.parent,
          permissionOverwrites: channel.permissionOverwrites.cache.toJSON(),
          position: channel.position,
          reason: 'KWI Guard: Silinen kanal geri oluşturuldu'
        });
      } else if (channel.type === ChannelType.GuildCategory) {
        newChannel = await channel.guild.channels.create({
          name: channel.name,
          type: ChannelType.GuildCategory,
          permissionOverwrites: channel.permissionOverwrites.cache.toJSON(),
          position: channel.position,
          reason: 'KWI Guard: Silinen kategori geri oluşturuldu'
        });
      }
      
      
      const result = await handleUnauthorizedAction(client, channel.guild, executor, reason, 'ban');
      
      
      if (!result.punished) {
        sendLog(
          client,
          'Kanal Silindi (İzinsiz)',
          `${executor.tag} (${executor.id}) kullanıcısı **${channel.name}** kanalını izinsiz sildi.\n\n` +
          '**Alınan Önlem:**\n' +
          `• Silinen kanal geri oluşturuldu.\n` +
          `• Kullanıcı uyarıldı (${result.offenseCount}/3).`,
          '#FF0000'
        );
      }
      
    } catch (error) {
      console.error('Kanal koruma hatası:', error);
    }
  },
};