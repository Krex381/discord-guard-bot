const { Events } = require('discord.js');
const { sendLog } = require('../utils/guardUtils');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Giriş yapıldı: ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: '🛡️ Sunucuyu koruyorum', type: 3 }],
      status: 'online'
    });
    
    
    sendLog(client, 'Bot Başlatıldı', `${client.user.tag} başarıyla başlatıldı.\nTüm güvenlik sistemleri aktif.`, '#00FF00');
  },
};