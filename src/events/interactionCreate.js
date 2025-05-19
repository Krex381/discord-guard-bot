const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      
      if (!command) {
        console.error(`${interaction.commandName} adında bir komut bulunamadı.`);
        return;
      }
      
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`${interaction.commandName} komutunda hata:`, error);
        
        const errorReply = {
          content: 'Bu komutu işlerken bir hata oluştu!',
          ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorReply);
        } else {
          await interaction.reply(errorReply);
        }
      }
    }
    
    
    if (interaction.isSelectMenu()) {
      if (interaction.customId.startsWith('help_menu')) {
        const command = client.slashCommands.get('yardım');
        if (command) {
          try {
            await command.handleMenu(interaction, client);
          } catch (error) {
            console.error('Yardım menüsünü işlerken hata:', error);
          }
        }
      }
    }
  },
};