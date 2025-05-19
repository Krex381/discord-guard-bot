const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Güvenli listeye kullanıcı ekler veya çıkarır.')
    
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('ekle')
        .setDescription('Güvenli listeye kullanıcı ekler.')
        .addUserOption(option =>
          option.setName('kullanıcı')
            .setDescription('Eklenecek kullanıcı')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('çıkar')
        .setDescription('Güvenli listeden kullanıcı çıkarır.')
        .addUserOption(option =>
          option.setName('kullanıcı')
            .setDescription('Çıkarılacak kullanıcı')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('liste')
        .setDescription('Güvenli listeyi görüntüler.')),

  async execute(interaction, client) {
    
    if (!config.owners || !config.owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: '⛔ Bu komutu sadece bot sahipleri kullanabilir! Sunucu yöneticisi olman yeterli değil.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    
    const configPath = path.join(__dirname, '../../../config.json');
    let currentConfig;
    try {
      currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.error('Config okuma hatası:', error);
      return interaction.reply({
        content: '⚠️ Yapılandırma dosyası okunamadı! Lütfen bot sahibine bildirin.',
        ephemeral: true
      });
    }
    
    
    if (!currentConfig.whitelist) {
      currentConfig.whitelist = [];
    }

    switch (subcommand) {
      case 'ekle':
        const userToAdd = interaction.options.getUser('kullanıcı');
        
        
        if (currentConfig.whitelist.includes(userToAdd.id)) {
          return interaction.reply({
            content: `⚠️ **${userToAdd.tag}** zaten güvenli listede!`,
            ephemeral: true
          });
        }
        
        
        currentConfig.whitelist.push(userToAdd.id);
        
        
        fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
        
        const addEmbed = new EmbedBuilder()
          .setTitle('🛡️ Güvenli Liste Güncellendi')
          .setDescription(`**${userToAdd.tag}** güvenli listeye eklendi.`)
          .setColor('#00FF00')
          .setFooter({ 
            text: `${interaction.guild.name} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          })
          .setTimestamp();
        
        return interaction.reply({ embeds: [addEmbed] });
        
      case 'çıkar':
        const userToRemove = interaction.options.getUser('kullanıcı');
        
        
        if (!currentConfig.whitelist.includes(userToRemove.id)) {
          return interaction.reply({
            content: `⚠️ **${userToRemove.tag}** güvenli listede değil!`,
            ephemeral: true
          });
        }
        
        
        currentConfig.whitelist = currentConfig.whitelist.filter(id => id !== userToRemove.id);
        
        
        fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
        
        const removeEmbed = new EmbedBuilder()
          .setTitle('🛡️ Güvenli Liste Güncellendi')
          .setDescription(`**${userToRemove.tag}** güvenli listeden çıkarıldı.`)
          .setColor('#FF9900')
          .setFooter({ 
            text: `${interaction.guild.name} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          })
          .setTimestamp();
        
        return interaction.reply({ embeds: [removeEmbed] });
        
      case 'liste':
        
        const listedUsers = [];
        
        for (const userId of currentConfig.whitelist) {
          try {
            const user = await client.users.fetch(userId);
            listedUsers.push(`<@${userId}> (${user.tag})`);
          } catch (error) {
            listedUsers.push(`<@${userId}> (Bilinmeyen Kullanıcı)`);
          }
        }
        
        const listEmbed = new EmbedBuilder()
          .setTitle('🛡️ Güvenli Kullanıcılar')
          .setDescription(listedUsers.length > 0 ? listedUsers.join('\n') : 'Güvenli listede kimse yok.')
          .setColor('#3498DB')
          .setFooter({
            text: `${interaction.guild.name} | Toplam: ${listedUsers.length} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          })
          .setTimestamp();
        
        return interaction.reply({ embeds: [listEmbed] });
    }
  },
};