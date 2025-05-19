const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
const path = require('path');


const userOffenses = new Map();

/**
 * Sends log to the configured log channel
 * @param {Object} client - Discord client instance
 * @param {String} title - Log title
 * @param {String} description - Log message
 * @param {String} color - Embed color (default: Red)
 */
const sendLog = async (client, title, description, color = '#FF0000') => {
  try {
    if (!config.logChannelId) return;
    
    const logChannel = client.channels.cache.get(config.logChannelId);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setTitle(`🛡️ KWI Guard | ${title}`)
      .setDescription(description)
      .setColor(color)
      .setFooter({ text: 'Developed by Krex' })
      .setTimestamp();
      
    await logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Log gönderme hatası:', error);
  }
};

/**
 * Get fresh config directly from file
 * @returns {Object} - Current config
 */
const getFreshConfig = () => {
  try {
    const configPath = path.join(__dirname, '../../config.json');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('Config okuma hatası:', error);
    return config; 
  }
};

/**
 * Checks if a user is authorized to perform protected actions
 * @param {Object} member - Guild member
 * @returns {Boolean} - Whether user is authorized
 */
const isAuthorized = (member) => {
  
  const currentConfig = getFreshConfig();
  
  
  if (currentConfig.owners && currentConfig.owners.includes(member.user.id)) return true;
  
  
  if (currentConfig.whitelist && currentConfig.whitelist.includes(member.user.id)) return true;
  
  
  return false;
};

/**
 * Checks if a setting is enabled
 * @param {String} setting - Setting name
 * @returns {Boolean} - Whether setting is enabled
 */
const isProtectionEnabled = (setting) => {
  
  const currentConfig = getFreshConfig();
  return currentConfig.guardSettings && currentConfig.guardSettings[setting] === true;
};

/**
 * Send warning DM to user
 * @param {Object} user - Discord user
 * @param {String} reason - Warning reason
 * @param {Number} offenseCount - Number of offenses
 * @param {String} guildName - Server name
 */
const sendWarningDM = async (user, reason, offenseCount, guildName) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Uyarı | ${guildName}`)
      .setDescription(`Sunucuda izinsiz işlem gerçekleştirdiğiniz için uyarıldınız.\n\n**Sebep:** ${reason}\n**Uyarı Sayısı:** ${offenseCount}/3\n\n3 uyarı almanız durumunda sunucudan yasaklanacaksınız.`)
      .setColor('#FFCC00')
      .setTimestamp()
      .setFooter({ text: 'KWI Guard Koruma Sistemi' });
    
    await user.send({ embeds: [embed] }).catch(err => {
      console.error('DM gönderme hatası:', err);
      
    });
  } catch (error) {
    console.error('Uyarı DM hatası:', error);
  }
};

/**
 * Send ban reason DM to user
 * @param {Object} user - Discord user
 * @param {String} reason - Ban reason
 * @param {String} guildName - Server name
 */
const sendBanReasonDM = async (user, reason, guildName) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`🚫 Yasaklama | ${guildName}`)
      .setDescription(`Sunucudan yasaklandınız.\n\n**Sebep:** ${reason}\n**Uyarı:** 3 kez izinsiz işlem gerçekleştirdiniz.`)
      .setColor('#FF0000')
      .setTimestamp()
      .setFooter({ text: 'KWI Guard Koruma Sistemi' });
    
    await user.send({ embeds: [embed] }).catch(err => {
      console.error('DM gönderme hatası:', err);
      
    });
  } catch (error) {
    console.error('Ban DM hatası:', error);
  }
};

/**
 * Track and handle unauthorized actions
 * @param {Object} client - Discord client
 * @param {Object} guild - Discord guild
 * @param {Object} user - User who performed the action
 * @param {String} reason - Offense reason
 * @param {String} type - Punishment type (ban, kick, timeout)
 * @returns {Object} - { punished: boolean, offenseCount: number }
 */
const handleUnauthorizedAction = async (client, guild, user, reason, type = 'ban') => {
  try {
    const userId = user.id;
    const guildId = guild.id;
    const key = `${guildId}-${userId}`;
    
    
    let offenseRecord = userOffenses.get(key) || { count: 0, lastOffense: null };
    
    
    if (offenseRecord.lastOffense && (Date.now() - offenseRecord.lastOffense) > 24 * 60 * 60 * 1000) {
      offenseRecord.count = 0;
    }
    
    
    offenseRecord.count += 1;
    offenseRecord.lastOffense = Date.now();
    userOffenses.set(key, offenseRecord);
    
    
    if (offenseRecord.count < 3) {
      await sendWarningDM(user, reason, offenseRecord.count, guild.name);
      
      
      sendLog(
        client,
        'Kullanıcı Uyarıldı',
        `${user.tag} (${userId}) kullanıcısı izinsiz işlem nedeniyle uyarıldı.\n\n` +
        `**Sebep:** ${reason}\n` +
        `**Uyarı Sayısı:** ${offenseRecord.count}/3`,
        '#FFCC00'
      );
      
      return { punished: false, offenseCount: offenseRecord.count };
    } 

    else {

      await sendBanReasonDM(user, reason, guild.name);

      const member = await guild.members.fetch(userId).catch(() => null);
      if (member) {
        switch (type.toLowerCase()) {
          case 'ban':
            await member.ban({ reason: `KWI Guard: ${reason} (3 kez izinsiz işlem)` });
            break;
          case 'kick':
            await member.kick(`KWI Guard: ${reason} (3 kez izinsiz işlem)`);
            break;
          case 'timeout':
            await member.timeout(24 * 60 * 60 * 1000, `KWI Guard: ${reason} (3 kez izinsiz işlem)`); 
            break;
        }
      }
      
      
      const punishmentType = type === 'ban' ? 'yasaklandı' : 
                              type === 'kick' ? 'atıldı' :
                              'zaman aşımına alındı';
      
      sendLog(
        client,
        '3 Kez İzinsiz İşlem',
        `${user.tag} (${userId}) kullanıcısı 3 kez izinsiz işlem gerçekleştirdiği için sunucudan ${punishmentType}.\n\n` +
        `**Son İhlal:** ${reason}`,
        '#FF0000'
      );
      
      return { punished: true, offenseCount: offenseRecord.count };
    }
  } catch (error) {
    console.error('İzinsiz işlem yönetimi hatası:', error);
    return { punished: false, offenseCount: 0, error: true };
  }
};

/**
 * Punish member based on offense
 * @param {Object} guild - Discord guild
 * @param {String} userId - User ID to punish
 * @param {String} reason - Punishment reason
 * @param {String} type - Punishment type (ban, kick, timeout)
 */
const punishMember = async (guild, userId, reason, type = 'ban') => {
  try {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return false;
    
    
    if (isAuthorized(member)) return false;
    
    switch (type.toLowerCase()) {
      case 'ban':
        await member.ban({ reason: `KWI Guard: ${reason}` });
        break;
      case 'kick':
        await member.kick(`KWI Guard: ${reason}`);
        break;
      case 'timeout':
        await member.timeout(60 * 60 * 1000, `KWI Guard: ${reason}`); 
        break;
    }
    
    return true;
  } catch (error) {
    console.error('Ceza verme hatası:', error);
    return false;
  }
};

module.exports = {
  sendLog,
  isAuthorized,
  isProtectionEnabled,
  punishMember,
  getFreshConfig,
  handleUnauthorizedAction
};