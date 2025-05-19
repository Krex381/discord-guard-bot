const { Collection } = require('discord.js');
const { sendLog } = require('./guardUtils');
const { EmbedBuilder } = require('discord.js');


const adViolationCache = new Collection();


const AD_PATTERNS = {
  
  DISCORD_INVITE: /(?:https?:\/\/)?(?:www\.|canary\.|ptb\.)?(?:discord(?:\.| )?(?:gg|io|me|li|com)|invite\.gg|dsc\.gg)(?:\/|\\)?(?:[^\s/]+)/i,
  
  
  SOCIAL_MEDIA: /(?:follow|add|join|check out) (?:me|us|my) on (?:instagram|facebook|twitter|tiktok|snapchat|youtube)/i,
  
  
  WEBSITE_PROMO: /(check out|visit|join|sign up at|go to) (?:https?:\/\/)?(?:www\.|)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/i,
  
  
  SERVER_PROMO: /(?:join|check out) (?:my|our) (?:server|guild|community|group|clan|team|discord)/i,
  
  
  TRADE_SALE: /(?:selling|trading|buy|i sell|i trade|cheap|for sale|boosting|services) .{0,30}(?:paypal|\$|€|£|nitro|robux|account|vbucks|skins|items)/i,
  
  
  URL_SHORTENERS: /(?:https?:\/\/)?(?:bit\.ly|tinyurl\.com|goo\.gl|t\.co|is\.gd|shorturl\.at|tiny\.cc|cutt\.ly)/i
};

/**
 * 
 * @param {Object} message 
 * @returns {Object} 
 */
const checkForAdvertisement = (message) => {
  const content = message.content.toLowerCase();
  const result = { isAd: false, type: null };
  
  
  for (const [type, pattern] of Object.entries(AD_PATTERNS)) {
    if (pattern.test(content)) {
      result.isAd = true;
      result.type = type;
      return result;
    }
  }
  
  
  if (content.includes('discord') && 
      (content.includes('join') || content.includes('invite') || 
       content.includes('come') || content.includes('server'))) {
    result.isAd = true;
    result.type = 'DISCORD_INVITE';
  }
  
  return result;
};

/**
 *
 * @param {Object} message
 * @param {String} adType
 * @param {Object} client
 */
const handleAdvertisement = async (message, adType, client) => {
  const { author, guild, channel } = message;
  
  try {
    
    await message.delete();
    
    
    let readableAdType = 'Bilinmeyen';
    switch (adType) {
      case 'DISCORD_INVITE':
        readableAdType = 'Discord Davet Linki';
        break;
      case 'SOCIAL_MEDIA':
        readableAdType = 'Sosyal Medya Reklamı';
        break;
      case 'WEBSITE_PROMO':
        readableAdType = 'Website Reklamı';
        break;
      case 'SERVER_PROMO':
        readableAdType = 'Sunucu Reklamı';
        break;
      case 'TRADE_SALE':
        readableAdType = 'Ticari Satış Reklamı';
        break;
      case 'URL_SHORTENERS':
        readableAdType = 'Kısaltılmış URL';
        break;
    }
    
    
    const warningMessage = await channel.send({
      content: `⚠️ ${author}, reklam yapmanız yasaktır! Tip: ${readableAdType}`
    });
    
    
    setTimeout(() => {
      warningMessage.delete().catch(() => {});
    }, 5000);
    
    
    sendLog(
      client,
      'Reklam Tespit Edildi',
      `${author.tag} (${author.id}) kullanıcısı reklam yapmaya çalıştı.\n\n` +
      `**Kanal:** ${channel.name}\n` +
      `**Reklam Türü:** ${readableAdType}\n` + 
      `**İçerik:** ${message.content.slice(0, 500)}`,
      '#FFA500'
    );
    
    
    if (!adViolationCache.has(author.id)) {
      adViolationCache.set(author.id, {
        count: 1,
        timeout: setTimeout(() => {
          adViolationCache.delete(author.id);
        }, 5 * 60 * 1000) 
      });
    } else {
      const offenseData = adViolationCache.get(author.id);
      offenseData.count++;
      
      
      if (offenseData.count >= 3) {
        try {
          
          await message.member.timeout(30 * 60 * 1000, 'Reklam koruması: Tekrarlanan reklam ihlali');
          
          sendLog(
            client,
            'Reklam Nedeniyle Timeout',
            `${author.tag} (${author.id}) kullanıcısı tekrarlanan reklam ihlali nedeniyle 30 dakika timeout aldı.`,
            '#FF0000'
          );
          
          
          adViolationCache.delete(author.id);
          
        } catch (error) {
          console.error('Timeout uygulama hatası:', error);
        }
      }
      
      
      clearTimeout(offenseData.timeout);
      offenseData.timeout = setTimeout(() => {
        adViolationCache.delete(author.id);
      }, 5 * 60 * 1000);
    }
    
  } catch (error) {
    console.error('Reklam engelleme hatası:', error);
  }
};

module.exports = {
  checkForAdvertisement,
  handleAdvertisement
};