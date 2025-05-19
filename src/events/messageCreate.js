const { Events, PermissionFlagsBits } = require('discord.js');
const { isAuthorized, isProtectionEnabled, punishMember, sendLog } = require('../utils/guardUtils');
const { checkMessageSpam, handleSpam } = require('../utils/spamProtection');
const { checkForAdvertisement, handleAdvertisement } = require('../utils/adBlockUtils');

module.exports = {
  name: Events.MessageCreate,
  async execute(message, client) {
    
    if (message.author.bot || !message.guild) return;
    
    
    if (isAuthorized(message.member)) return;
    
    
    if (isProtectionEnabled('everyoneHereProtection')) {
      
      if (
        (message.content.includes('@everyone') || message.content.includes('@here')) && 
        !message.member.permissions.has(PermissionFlagsBits.MentionEveryone)
      ) {
        try {
          
          await message.delete();
          
          
          const warningMessage = await message.channel.send({
            content: `⚠️ ${message.author}, @everyone/@here kullanımı yasaklanmıştır!`
          });
          
          
          setTimeout(() => {
            warningMessage.delete().catch(() => {});
          }, 5000);
          
          
          sendLog(
            client,
            '@everyone/@here Kullanım Denemesi',
            `${message.author.tag} (${message.author.id}) kullanıcısı izinsiz şekilde @everyone/@here kullanmaya çalıştı.\n\n` +
            `**Kanal:** ${message.channel.name}\n` +
            `**İçerik:** ${message.content.slice(0, 500)}`,
            '#FFA500'
          );
          
          return; 
        } catch (error) {
          console.error('@everyone/@here koruma hatası:', error);
        }
      }
    }
    
    
    if (isProtectionEnabled('spamProtection')) {
      const spamCheck = checkMessageSpam(message, client);
      if (spamCheck.isSpam) {
        await handleSpam(message, spamCheck.reason, client);
        return; 
      }
    }
    
    
    if (isProtectionEnabled('adBlockProtection')) {
      const adCheck = checkForAdvertisement(message);
      if (adCheck.isAd) {
        await handleAdvertisement(message, adCheck.type, client);
        return;
      }
    }
  },
};