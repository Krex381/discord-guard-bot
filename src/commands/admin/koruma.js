const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('koruma')
    .setDescription('Koruma sistemlerini yönetir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('ayarlar')
        .setDescription('Koruma sistemlerini açıp kapatmanızı sağlar.')),

  async execute(interaction, client) {
    
    if (!config.owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: '⛔ Bu komutu sadece bot sahipleri kullanabilir!',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'ayarlar') {
      
      const settingsEmbed = new EmbedBuilder()
        .setTitle('🛡️ KWI Guard - Koruma Ayarları')
        .setDescription('Aşağıdaki menüden açıp kapatmak istediğiniz koruma sistemini seçin.')
        .setColor('#3498DB')
        .addFields(
          { 
            name: 'Rol Koruması', 
            value: config.guardSettings.roleProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Kanal Koruması', 
            value: config.guardSettings.channelProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Emoji Koruması', 
            value: config.guardSettings.emojiProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Sunucu Koruması', 
            value: config.guardSettings.guildUpdateProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Ban/Kick Koruması', 
            value: config.guardSettings.banKickProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Bot Koruması', 
            value: config.guardSettings.botAddProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Webhook Koruması', 
            value: config.guardSettings.webhookProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Rol Dağıtım Koruması', 
            value: config.guardSettings.roleDistributionProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Raid Koruması', 
            value: config.guardSettings.raidProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: '@everyone/@here Koruması', 
            value: config.guardSettings.everyoneHereProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Spam Koruması', 
            value: config.guardSettings.spamProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          },
          { 
            name: 'Reklam Engelleme', 
            value: config.guardSettings.adBlockProtection ? '✅ Aktif' : '❌ Devre Dışı', 
            inline: true 
          }
        )
        .setFooter({
          text: `${interaction.guild.name} | Bot sahibi tarafından yapılandırılabilir | Developed by Krex`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      
      const settingsMenu = new StringSelectMenuBuilder()
        .setCustomId('guard_settings_menu')
        .setPlaceholder('⚙️ Değiştirmek istediğiniz ayarı seçin')
        .addOptions([
          new StringSelectMenuOptionBuilder()
            .setLabel('Rol Koruması')
            .setDescription(config.guardSettings.roleProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_roleProtection')
            .setEmoji(config.guardSettings.roleProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Kanal Koruması')
            .setDescription(config.guardSettings.channelProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_channelProtection')
            .setEmoji(config.guardSettings.channelProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Emoji Koruması')
            .setDescription(config.guardSettings.emojiProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_emojiProtection')
            .setEmoji(config.guardSettings.emojiProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Sunucu Koruması')
            .setDescription(config.guardSettings.guildUpdateProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_guildUpdateProtection')
            .setEmoji(config.guardSettings.guildUpdateProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Ban/Kick Koruması')
            .setDescription(config.guardSettings.banKickProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_banKickProtection')
            .setEmoji(config.guardSettings.banKickProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Bot Koruması')
            .setDescription(config.guardSettings.botAddProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_botAddProtection')
            .setEmoji(config.guardSettings.botAddProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Webhook Koruması')
            .setDescription(config.guardSettings.webhookProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_webhookProtection')
            .setEmoji(config.guardSettings.webhookProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Rol Dağıtım Koruması')
            .setDescription(config.guardSettings.roleDistributionProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_roleDistributionProtection')
            .setEmoji(config.guardSettings.roleDistributionProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Raid Koruması')
            .setDescription(config.guardSettings.raidProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_raidProtection')
            .setEmoji(config.guardSettings.raidProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('@everyone/@here Koruması')
            .setDescription(config.guardSettings.everyoneHereProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_everyoneHereProtection')
            .setEmoji(config.guardSettings.everyoneHereProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Spam Koruması')
            .setDescription(config.guardSettings.spamProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_spamProtection')
            .setEmoji(config.guardSettings.spamProtection ? '🔴' : '🟢'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Reklam Engelleme')
            .setDescription(config.guardSettings.adBlockProtection ? 'Devre dışı bırak' : 'Aktifleştir')
            .setValue('toggle_adBlockProtection')
            .setEmoji(config.guardSettings.adBlockProtection ? '🔴' : '🟢'),
        ]);

      const actionRow = new ActionRowBuilder().addComponents(settingsMenu);

      const response = await interaction.reply({ 
        embeds: [settingsEmbed], 
        components: [actionRow],
        fetchReply: true 
      });
      
      
      this.settingsMessages = this.settingsMessages || new Map();
      this.settingsMessages.set(response.id, { userId: interaction.user.id });
      
      
      const collector = response.createMessageComponentCollector({ 
        time: 5 * 60 * 1000 
      });
      
      collector.on('collect', async i => {
        
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: '⚠️ Bu menüyü sadece komutu kullanan kişi kullanabilir.',
            ephemeral: true
          });
        }
        
        if (i.customId === 'guard_settings_menu') {
          const configPath = path.join(__dirname, '../../../config.json');
          const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          
          const selectedValue = i.values[0];
          if (selectedValue.startsWith('toggle_')) {
            const settingName = selectedValue.replace('toggle_', '');
            
            
            currentConfig.guardSettings[settingName] = !currentConfig.guardSettings[settingName];
            
            
            fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
            
            
            const updatedEmbed = new EmbedBuilder()
              .setTitle('🛡️ KWI Guard - Koruma Ayarları')
              .setDescription(`**${settingName}** ayarı ${currentConfig.guardSettings[settingName] ? '✅ aktifleştirildi' : '❌ devre dışı bırakıldı'}.`)
              .setColor(currentConfig.guardSettings[settingName] ? '#00FF00' : '#FF0000')
              .addFields(
                { 
                  name: 'Rol Koruması', 
                  value: currentConfig.guardSettings.roleProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Kanal Koruması', 
                  value: currentConfig.guardSettings.channelProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Emoji Koruması', 
                  value: currentConfig.guardSettings.emojiProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Sunucu Koruması', 
                  value: currentConfig.guardSettings.guildUpdateProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Ban/Kick Koruması', 
                  value: currentConfig.guardSettings.banKickProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Bot Koruması', 
                  value: currentConfig.guardSettings.botAddProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Webhook Koruması', 
                  value: currentConfig.guardSettings.webhookProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Rol Dağıtım Koruması', 
                  value: currentConfig.guardSettings.roleDistributionProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Raid Koruması', 
                  value: currentConfig.guardSettings.raidProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: '@everyone/@here Koruması', 
                  value: currentConfig.guardSettings.everyoneHereProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Spam Koruması', 
                  value: currentConfig.guardSettings.spamProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                },
                { 
                  name: 'Reklam Engelleme', 
                  value: currentConfig.guardSettings.adBlockProtection ? '✅ Aktif' : '❌ Devre Dışı', 
                  inline: true 
                }
              )
              .setFooter({
                text: `${interaction.guild.name} | Ayarlar güncellendi | Developed by Krex`,
                iconURL: interaction.guild.iconURL({ dynamic: true })
              })
              .setTimestamp();
              
            
            const updatedMenu = new StringSelectMenuBuilder()
              .setCustomId('guard_settings_menu')
              .setPlaceholder('⚙️ Değiştirmek istediğiniz ayarı seçin')
              .addOptions([
                new StringSelectMenuOptionBuilder()
                  .setLabel('Rol Koruması')
                  .setDescription(currentConfig.guardSettings.roleProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_roleProtection')
                  .setEmoji(currentConfig.guardSettings.roleProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Kanal Koruması')
                  .setDescription(currentConfig.guardSettings.channelProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_channelProtection')
                  .setEmoji(currentConfig.guardSettings.channelProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Emoji Koruması')
                  .setDescription(currentConfig.guardSettings.emojiProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_emojiProtection')
                  .setEmoji(currentConfig.guardSettings.emojiProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Sunucu Koruması')
                  .setDescription(currentConfig.guardSettings.guildUpdateProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_guildUpdateProtection')
                  .setEmoji(currentConfig.guardSettings.guildUpdateProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Ban/Kick Koruması')
                  .setDescription(currentConfig.guardSettings.banKickProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_banKickProtection')
                  .setEmoji(currentConfig.guardSettings.banKickProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Bot Koruması')
                  .setDescription(currentConfig.guardSettings.botAddProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_botAddProtection')
                  .setEmoji(currentConfig.guardSettings.botAddProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Webhook Koruması')
                  .setDescription(currentConfig.guardSettings.webhookProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_webhookProtection')
                  .setEmoji(currentConfig.guardSettings.webhookProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Rol Dağıtım Koruması')
                  .setDescription(currentConfig.guardSettings.roleDistributionProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_roleDistributionProtection')
                  .setEmoji(currentConfig.guardSettings.roleDistributionProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Raid Koruması')
                  .setDescription(currentConfig.guardSettings.raidProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_raidProtection')
                  .setEmoji(currentConfig.guardSettings.raidProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('@everyone/@here Koruması')
                  .setDescription(currentConfig.guardSettings.everyoneHereProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_everyoneHereProtection')
                  .setEmoji(currentConfig.guardSettings.everyoneHereProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Spam Koruması')
                  .setDescription(currentConfig.guardSettings.spamProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_spamProtection')
                  .setEmoji(currentConfig.guardSettings.spamProtection ? '🔴' : '🟢'),
                new StringSelectMenuOptionBuilder()
                  .setLabel('Reklam Engelleme')
                  .setDescription(currentConfig.guardSettings.adBlockProtection ? 'Devre dışı bırak' : 'Aktifleştir')
                  .setValue('toggle_adBlockProtection')
                  .setEmoji(currentConfig.guardSettings.adBlockProtection ? '🔴' : '🟢'),
              ]);

            const updatedRow = new ActionRowBuilder().addComponents(updatedMenu);
            
            
            await i.update({
              embeds: [updatedEmbed],
              components: [updatedRow]
            });
          }
        }
      });
      
      collector.on('end', () => {
        
        try {
          if (response && !response.deleted) {
            interaction.editReply({ components: [] }).catch(() => {});
          }
        } catch (error) {
          console.error('Settings menu timeout error:', error);
        }
      });
    }
  }
};