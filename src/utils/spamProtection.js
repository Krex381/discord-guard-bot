const { Collection } = require('discord.js');
const { sendLog } = require('./guardUtils');


const messageCache = new Collection();


const RATE_LIMIT = 5; 
const TIME_WINDOW = 3000; 
const DUPLICATE_THRESHOLD = 3; 
const MAX_MENTION_COUNT = 5; 

/**
 * Checks if a message is spam based on rate, duplicates, and patterns
 * @param {Object} message - Discord message object
 * @param {Object} client - Discord client
 * @returns {Object} - Contains isSpam and reason if spam is detected
 */
const checkMessageSpam = (message, client) => {
  const { author, content, guild } = message;
  const userId = author.id;
  const result = { isSpam: false, reason: null };
  
  
  if (!messageCache.has(userId)) {
    messageCache.set(userId, {
      messages: [],
      lastMessageContent: '',
      duplicateCount: 0,
      timeout: null
    });
  }
  
  const userData = messageCache.get(userId);
  const now = Date.now();
  
  
  userData.messages = userData.messages.filter(msg => now - msg.timestamp < TIME_WINDOW);
  
  
  userData.messages.push({
    content: content,
    timestamp: now
  });
  
  
  if (userData.messages.length >= RATE_LIMIT) {
    result.isSpam = true;
    result.reason = 'rate_limit';
  }
  
  
  if (content === userData.lastMessageContent) {
    userData.duplicateCount++;
    if (userData.duplicateCount >= DUPLICATE_THRESHOLD) {
      result.isSpam = true;
      result.reason = 'duplicate_messages';
    }
  } else {
    userData.duplicateCount = 0;
    userData.lastMessageContent = content;
  }
  
  
  if (message.mentions.users.size > MAX_MENTION_COUNT) {
    result.isSpam = true;
    result.reason = 'excessive_mentions';
  }
  
  
  const emojiRegex = /(<a?)?:\w+:(\d+>)?|[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
  const emojiCount = (content.match(emojiRegex) || []).length;
  if (emojiCount > 10) {
    result.isSpam = true;
    result.reason = 'excessive_emojis';
  }
  
  
  clearTimeout(userData.timeout);
  userData.timeout = setTimeout(() => {
    messageCache.delete(userId);
  }, 30000); 
  
  return result;
};

/**
 * Takes action against spam message
 * @param {Object} message - Discord message object
 * @param {String} reason - Reason for spam detection
 * @param {Object} client - Discord client object
 */
const handleSpam = async (message, reason, client) => {
  const { author, guild, channel } = message;
  
  try {
    
    await message.delete();
    
    let warningText = '';
    let logDescription = '';
    
    switch (reason) {
      case 'rate_limit':
        warningText = 'çok hızlı mesaj gönderimi';
        logDescription = `${author.tag} (${author.id}) kullanıcısı çok hızlı mesaj göndererek spam yaptı.\n`;
        break;
      case 'duplicate_messages':
        warningText = 'aynı mesajı tekrar tekrar gönderme';
        logDescription = `${author.tag} (${author.id}) kullanıcısı aynı mesajı tekrarlayarak spam yaptı.\n`;
        break;
      case 'excessive_mentions':
        warningText = 'çok fazla etiketleme';
        logDescription = `${author.tag} (${author.id}) kullanıcısı tek bir mesajda çok fazla etiket kullandı.\n`;
        break;
      case 'excessive_emojis':
        warningText = 'çok fazla emoji kullanımı';
        logDescription = `${author.tag} (${author.id}) kullanıcısı mesajında çok fazla emoji kullandı.\n`;
        break;
      default:
        warningText = 'spam davranışı';
        logDescription = `${author.tag} (${author.id}) kullanıcısı spam yaptı.\n`;
    }
    
    
    const warningMessage = await channel.send({
      content: `⚠️ ${author}, ${warningText} tespit edildi! Lütfen bu davranışı durdurun.`
    });
    
    
    setTimeout(() => {
      warningMessage.delete().catch(() => {});
    }, 5000);
    
    
    sendLog(
      client,
      'Spam Tespit Edildi',
      logDescription +
      `**Kanal:** ${channel.name}\n` +
      `**Tespit Türü:** ${warningText}\n` + 
      `**İçerik:** ${message.content.slice(0, 500)}`,
      '#FFA500'
    );
    
    
    if (!messageCache.has(`spamOffense_${author.id}`)) {
      messageCache.set(`spamOffense_${author.id}`, {
        count: 1,
        timeout: setTimeout(() => {
          messageCache.delete(`spamOffense_${author.id}`);
        }, 60000) 
      });
    } else {
      const offenseData = messageCache.get(`spamOffense_${author.id}`);
      offenseData.count++;
      
      
      if (offenseData.count >= 3) {
        try {
          
          await message.member.timeout(10 * 60 * 1000, 'Spam koruması: Tekrarlanan spam davranışı');
          
          sendLog(
            client,
            'Spam Nedeniyle Timeout',
            `${author.tag} (${author.id}) kullanıcısı tekrarlanan spam davranışı nedeniyle 10 dakika timeout aldı.`,
            '#FF0000'
          );
          
          messageCache.delete(`spamOffense_${author.id}`);
          
        } catch (error) {
          console.error('Timeout uygulama hatası:', error);
        }
      }
      
      clearTimeout(offenseData.timeout);
      offenseData.timeout = setTimeout(() => {
        messageCache.delete(`spamOffense_${author.id}`);
      }, 60000);
    }
    
  } catch (error) {
    console.error('Spam koruma hatası:', error);
  }
};

module.exports = {
  checkMessageSpam,
  handleSpam
};