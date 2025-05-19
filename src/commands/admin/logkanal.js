const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log-kanal')
    .setDescription('Koruma sistemi log kanalını ayarlar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Log kanalı olarak ayarlanacak metin kanalı')
        .setRequired(true)),

  async execute(interaction, client) {
    
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '⛔ Bu komutu kullanmak için yönetici yetkisine sahip olmalısın!',
        ephemeral: true
      });
    }

    const logChannel = interaction.options.getChannel('kanal');
    
    
    if (logChannel.type !== 0) { 
      return interaction.reply({
        content: '⚠️ Log kanalı olarak sadece metin kanalları seçilebilir!',
        ephemeral: true
      });
    }
    
    try {
      
      const configPath = path.join(__dirname, '../../../config.json');
      const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      
      
      const oldLogChannelId = currentConfig.logChannelId;
      currentConfig.logChannelId = logChannel.id;
      
      
      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
      
      
      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Log Kanalı Ayarlandı')
        .setDescription(`Koruma sistemi log kanalı <#${logChannel.id}> olarak ayarlandı.`)
        .setColor('#00FF00')
        .setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();
        
      await interaction.reply({ embeds: [successEmbed] });
      
      
      const testEmbed = new EmbedBuilder()
        .setTitle('🛡️ KWI Guard | Log Kanalı Testi')
        .setDescription('Bu kanal koruma sistemi log kanalı olarak ayarlandı.\nTüm güvenlik olayları bu kanala gönderilecektir.')
        .setColor('#3498DB')
        .setFooter({
          text: `${interaction.guild.name} | Ayarlayan: ${interaction.user.tag}`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();
        
      await logChannel.send({ embeds: [testEmbed] });
      
    } catch (error) {
      console.error('Log kanalı ayarlama hatası:', error);
      
      await interaction.reply({
        content: '❌ Log kanalı ayarlanırken bir hata oluştu. Lütfen tekrar deneyin.',
        ephemeral: true
      });
    }
  },
};