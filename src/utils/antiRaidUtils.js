const { Collection } = require('discord.js');
const { sendLog } = require('./guardUtils');


const recentJoins = new Collection();
let isRaidMode = false;


const RAID_JOIN_THRESHOLD = 10; 
const RAID_TIME_WINDOW = 10000; 
const RAID_MODE_DURATION = 60000 * 10; 

/**
 * 
 * @param {Object} member 
 * @param {Object} client
 */
const processJoin = async (member, client) => {
  const { guild, user } = member;
  
  
  const now = Date.now();
  recentJoins.set(user.id, now);
  
  
  recentJoins.sweep(joinTime => now - joinTime > RAID_TIME_WINDOW);
  
  
  if (!isRaidMode && recentJoins.size >= RAID_JOIN_THRESHOLD) {
    
    isRaidMode = true;
    
    sendLog(
      client,
      '⚠️ RAİD ALARMI AKTİF',
      `Son ${RAID_TIME_WINDOW / 1000} saniye içinde ${recentJoins.size} yeni üye katıldı!\n\n` +
      `Raid koruması ${RAID_MODE_DURATION / 60000} dakika boyunca aktif olacak.\n` +
      `Bu süre boyunca yeni katılan üyeler otomatik olarak izleme altına alınacak.`,
      '#FF0000'
    );
    
    
    setTimeout(() => {
      isRaidMode = false;
      
      sendLog(
        client,
        '✅ RAİD ALARMI KAPANDI',
        `Raid koruması devre dışı bırakıldı. Sunucu normal duruma döndü.`,
        '#00FF00'
      );
    }, RAID_MODE_DURATION);
  }
  
  
  if (isRaidMode) {
    
    
    try {
      await member.timeout(RAID_MODE_DURATION, 'Raid koruması: Şüpheli zamanda katılım');
      
      sendLog(
        client,
        'Raid Koruması - Üye Zamanaşımı',
        `${user.tag} (${user.id}) kullanıcısı raid koruması aktifken katıldığı için otomatik olarak zaman aşımına alındı.`,
        '#FFA500'
      );
    } catch (error) {
      console.error('Raid koruma hatası:', error);
    }
    
    
    
    
    
  }
};

/**
 * 
 * @param {Object} guild
 * @param {Object} client
 * @param {String} reason
 */
const activateRaidMode = async (guild, client, reason = 'Manuel aktivasyon') => {
  if (isRaidMode) return false;
  
  isRaidMode = true;
  
  sendLog(
    client,
    '⚠️ RAİD ALARMI MANUEL AKTİF',
    `Raid koruması manuel olarak aktifleştirildi.\n` +
    `**Sebep:** ${reason}\n\n` +
    `Raid koruması ${RAID_MODE_DURATION / 60000} dakika boyunca aktif olacak.`,
    '#FF0000'
  );
  
  
  setTimeout(() => {
    isRaidMode = false;
    
    sendLog(
      client,
      '✅ RAİD ALARMI KAPANDI',
      `Raid koruması devre dışı bırakıldı. Sunucu normal duruma döndü.`,
      '#00FF00'
    );
  }, RAID_MODE_DURATION);
  
  return true;
};

/**
 * Manually deactivates raid mode
 * @param {Object} client - Discord client
 * @param {String} reason - Reason for manual deactivation
 */
const deactivateRaidMode = async (client, reason = 'Manuel deaktivasyon') => {
  if (!isRaidMode) return false;
  
  isRaidMode = false;
  
  sendLog(
    client,
    '✅ RAİD ALARMI MANUEL KAPATILDI',
    `Raid koruması manuel olarak devre dışı bırakıldı.\n` +
    `**Sebep:** ${reason}`,
    '#00FF00'
  );
  
  return true;
};

/**
 * Checks if raid mode is currently active
 * @returns {Boolean} - Whether raid mode is active
 */
const isRaidModeActive = () => {
  return isRaidMode;
};

module.exports = {
  processJoin,
  activateRaidMode,
  deactivateRaidMode,
  isRaidModeActive
};