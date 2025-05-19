const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give-all')
    .setDescription('Seçilen rolü sunucudaki tüm üyelere verir.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option => 
      option.setName('rol')
        .setDescription('Tüm üyelere verilecek rol')
        .setRequired(true)),

  async execute(interaction, client) {
    
    if (!config.owners.includes(interaction.user.id) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '⛔ Bu komutu kullanma yetkiniz yok!',
        ephemeral: true
      });
    }

    await interaction.deferReply();
    
    const role = interaction.options.getRole('rol');
    const { guild } = interaction;
    
    
    if (!role.editable) {
      return interaction.editReply({
        content: '⚠️ Bu rol bot tarafından yönetilemez. Lütfen botun rolünün, verilecek rolden daha yukarıda olduğundan emin olun.',
        ephemeral: true
      });
    }
    
    try {
      
      const progressEmbed = new EmbedBuilder()
        .setTitle('🔄 Rol Veriliyor...')
        .setDescription(`**${role.name}** rolü tüm üyelere veriliyor. Bu işlem biraz zaman alabilir.`)
        .setColor('#3498DB')
        .setFooter({
          text: `${interaction.guild.name} | Developed by Krex`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [progressEmbed] });
      
      
      await guild.members.fetch();
      
      let successCount = 0;
      let failCount = 0;
      
      
      const allMembers = [...guild.members.cache.values()];
      
      
      const chunkSize = 25;
      for (let i = 0; i < allMembers.length; i += chunkSize) {
        const chunk = allMembers.slice(i, i + chunkSize);
        
        
        const promises = chunk.map(async (member) => {
          
          if (member.user.bot) return;
          
          
          if (member.roles.cache.has(role.id)) return;
          
          try {
            await member.roles.add(role, `"${interaction.user.tag}" tarafından /give-all komutu kullanılarak eklendi`);
            successCount++;
          } catch (error) {
            console.error(`${member.user.tag} kullanıcısına rol verme hatası:`, error);
            failCount++;
          }
        });
        
        
        await Promise.all(promises);
        
        
        if (i % 100 === 0 && i > 0) {
          const updatedEmbed = new EmbedBuilder()
            .setTitle('🔄 Rol Veriliyor...')
            .setDescription(`**${role.name}** rolü tüm üyelere veriliyor.\n\n` +
                          `• İşlenen: ${i}/${allMembers.length} üye\n` +
                          `• Başarılı: ${successCount}\n` +
                          `• Başarısız: ${failCount}`)
            .setColor('#3498DB')
            .setFooter({
              text: `${interaction.guild.name} | Developed by Krex`,
              iconURL: interaction.guild.iconURL({ dynamic: true })
            })
            .setTimestamp();
            
          await interaction.editReply({ embeds: [updatedEmbed] });
        }
        
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      
      const completionEmbed = new EmbedBuilder()
        .setTitle('✅ İşlem Tamamlandı')
        .setDescription(`**${role.name}** rolü sunucudaki üyelere verildi.`)
        .addFields([
          { name: 'Toplam İşlenen', value: `${allMembers.length} üye`, inline: true },
          { name: 'Başarılı', value: `${successCount} üye`, inline: true },
          { name: 'Başarısız', value: `${failCount} üye`, inline: true }
        ])
        .setColor('#00FF00')
        .setFooter({
          text: `${interaction.guild.name} | Developed by Krex`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [completionEmbed] });
      
      
      const { sendLog } = require('../../utils/guardUtils');
      sendLog(
        client,
        'Toplu Rol Verildi',
        `${interaction.user.tag} (${interaction.user.id}) kullanıcısı **${role.name}** rolünü tüm sunucu üyelerine verdi.\n\n` +
        `• Başarılı: ${successCount} üye\n` +
        `• Başarısız: ${failCount} üye`,
        '#00FF00'
      );
    } catch (error) {
      console.error('Toplu rol verme hatası:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Hata')
        .setDescription(`Roller verilirken bir hata oluştu: ${error.message}`)
        .setColor('#FF0000')
        .setFooter({
          text: `${interaction.guild.name} | Developed by Krex`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
};