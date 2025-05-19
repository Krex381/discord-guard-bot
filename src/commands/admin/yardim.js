const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yardım')
    .setDescription('Bot komutları ve koruma sistemleri hakkında bilgi verir.'),

  async execute(interaction, client) {
    const mainEmbed = new EmbedBuilder()
      .setTitle('🛡️ KWI Guard Bot - Yardım Menüsü')
      .setDescription('Aşağıdaki menüden bir kategori seçerek detaylı bilgi alabilirsiniz.')
      .setColor('#3498DB')
      .addFields(
        { name: 'Koruma Sistemleri', value: 'Sunucunuzu koruyan güvenlik sistemleri' },
        { name: 'Komutlar', value: 'Kullanabileceğiniz tüm bot komutları' },
        { name: 'Ayarlar', value: 'Bot ayarları ve konfigürasyon seçenekleri' }
      )
      .setFooter({
        text: `${interaction.guild.name} | Developed by Krex`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_menu')
      .setPlaceholder('📚 Bir kategori seç')
      .addOptions([
        new StringSelectMenuOptionBuilder()
          .setLabel('Ana Menü')
          .setDescription('Ana yardım menüsüne dön')
          .setValue('help_main')
          .setEmoji('🏠'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Rol Koruması')
          .setDescription('Rol oluşturma, silme ve düzenleme koruması')
          .setValue('help_role_protection')
          .setEmoji('👑'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Kanal Koruması')
          .setDescription('Kanal oluşturma, silme ve düzenleme koruması')
          .setValue('help_channel_protection')
          .setEmoji('📝'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Sunucu Koruması')
          .setDescription('Sunucu ayarları değişiklik koruması')
          .setValue('help_server_protection')
          .setEmoji('🌐'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Ban/Kick Koruması')
          .setDescription('İzinsiz ban ve kick koruması')
          .setValue('help_ban_protection')
          .setEmoji('🔨'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Bot Koruması')
          .setDescription('İzinsiz bot ekleme koruması')
          .setValue('help_bot_protection')
          .setEmoji('🤖'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Spam Koruması')
          .setDescription('Gelişmiş spam ve flood koruması')
          .setValue('help_spam_protection')
          .setEmoji('🛑'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Reklam Koruması')
          .setDescription('Gelişmiş reklam engelleme sistemi')
          .setValue('help_ad_protection')
          .setEmoji('🚫'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Diğer Korumalar')
          .setDescription('Webhook, emoji ve diğer korumalar')
          .setValue('help_other_protection')
          .setEmoji('⚙️'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Komutlar')
          .setDescription('Bot komutları hakkında bilgi')
          .setValue('help_commands')
          .setEmoji('🔧'),
      ]);

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    const response = await interaction.reply({ 
      embeds: [mainEmbed], 
      components: [actionRow],
      fetchReply: true 
    });

    
    this.helpMessages = this.helpMessages || new Map();
    this.helpMessages.set(response.id, { userId: interaction.user.id });

    
    setTimeout(() => {
      try {
        if (response && !response.deleted) {
          interaction.editReply({ components: [] }).catch(() => {});
        }
      } catch (error) {
        console.error('Help menu timeout error:', error);
      }
    }, 5 * 60 * 1000);
  },

  
  async handleMenu(interaction, client) {
    if (!interaction.isStringSelectMenu() || !interaction.customId.startsWith('help_menu')) return;
    
    
    const helpMessageInfo = this.helpMessages && this.helpMessages.get(interaction.message.id);
    if (helpMessageInfo && helpMessageInfo.userId !== interaction.user.id) {
      return interaction.reply({ 
        content: '⚠️ Bu menüyü sadece komutu kullanan kişi kullanabilir.', 
        ephemeral: true 
      });
    }
    
    const selected = interaction.values[0];
    let responseEmbed;
    
    switch (selected) {
      case 'help_main':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard Bot - Yardım Menüsü')
          .setDescription('Aşağıdaki menüden bir kategori seçerek detaylı bilgi alabilirsiniz.')
          .setColor('#3498DB')
          .addFields(
            { name: 'Koruma Sistemleri', value: 'Sunucunuzu koruyan güvenlik sistemleri' },
            { name: 'Komutlar', value: 'Kullanabileceğiniz tüm bot komutları' },
            { name: 'Ayarlar', value: 'Bot ayarları ve konfigürasyon seçenekleri' }
          )
          .setFooter({
            text: `${interaction.guild.name} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          })
          .setTimestamp();
        break;
        
      case 'help_role_protection':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard - Rol Koruması')
          .setColor('#e74c3c')
          .setDescription('Sunucunuzdaki rolleri koruma sistemidir.')
          .addFields(
            { name: '🔹 Rol Silme Koruması', value: 'İzinsiz rol silinirse, silen kişi banlanır ve rol geri oluşturulur.' },
            { name: '🔹 Rol Düzenleme Koruması', value: 'İzinsiz rol düzenlenirse, değişiklikler geri alınır ve düzenleyen kişi cezalandırılır.' },
            { name: '🔹 Rol Oluşturma Koruması', value: 'İzinsiz rol oluşturulursa, rol silinir ve oluşturan kişi loglanır.' }
          )
          .setFooter({
            text: `Durum: ${config.guardSettings.roleProtection ? '✅ Aktif' : '❌ Devre Dışı'} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
        
      case 'help_channel_protection':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard - Kanal Koruması')
          .setColor('#3498db')
          .setDescription('Sunucunuzdaki kanalları koruma sistemidir.')
          .addFields(
            { name: '🔹 Kanal Silme Koruması', value: 'İzinsiz kanal silinirse, silen kişi banlanır ve kanal geri oluşturulur (aynı izinler, aynı kategori ile).' },
            { name: '🔹 Kanal Düzenleme Koruması', value: 'İzinsiz kanal düzenlenirse, değişiklikler geri alınır ve düzenleyen kişi cezalandırılır.' },
            { name: '🔹 Kanal Oluşturma Koruması', value: 'İzinsiz kanal oluşturulursa, kanal silinir ve oluşturan kişi loglanır.' }
          )
          .setFooter({
            text: `Durum: ${config.guardSettings.channelProtection ? '✅ Aktif' : '❌ Devre Dışı'} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
        
      case 'help_server_protection':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard - Sunucu Koruması')
          .setColor('#9b59b6')
          .setDescription('Sunucunuzun genel ayarlarını koruma sistemidir.')
          .addFields(
            { name: '🔹 Sunucu İsim Koruması', value: 'İzinsiz sunucu adı değiştirilirse, eski ismine geri alınır.' },
            { name: '🔹 Sunucu İkon Koruması', value: 'İzinsiz sunucu ikonu değiştirilirse, eski ikonuna geri alınır.' },
            { name: '🔹 Sunucu Banner Koruması', value: 'İzinsiz sunucu banner değiştirilirse, eski bannerina geri alınır.' },
            { name: '🔹 Sunucu Ayarları Koruması', value: 'Diğer sunucu ayarları değiştirildiğinde de koruma sağlanır.' }
          )
          .setFooter({
            text: `Durum: ${config.guardSettings.guildUpdateProtection ? '✅ Aktif' : '❌ Devre Dışı'} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
        
      case 'help_ban_protection':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard - Ban/Kick Koruması')
          .setColor('#e67e22')
          .setDescription('Kullanıcıların yetkisiz ban/kick edilmesini engeller.')
          .addFields(
            { name: '🔹 Ban Koruması', value: 'Yetkisiz bir kişi ban atarsa, atılan ban geri alınır ve ban atan kişi cezalandırılır.' },
            { name: '🔹 Kick Koruması', value: 'Yetkisiz bir kişi başkasını kicklerse, o kişi cezalandırılır.' },
            { name: '🔹 Toplu Ban/Kick Koruması', value: 'Kısa sürede çok sayıda ban/kick işlemi yapılırsa, bu işlemler durdurulur ve yapan kişi cezalandırılır.' }
          )
          .setFooter({
            text: `Durum: ${config.guardSettings.banKickProtection ? '✅ Aktif' : '❌ Devre Dışı'} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
        
      case 'help_bot_protection':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard - Bot Koruması')
          .setColor('#f1c40f')
          .setDescription('Sunucunuza yetkisiz bot eklenmesini engeller.')
          .addFields(
            { name: '🔹 Bot Ekleme Koruması', value: 'Yetkisiz kişilerin sunucuya bot eklemesi durumunda bot sunucudan atılır.' },
            { name: '🔹 Bot Ekleyenlere Yaptırım', value: 'İzinsiz bot ekleyen kişiler sunucudan yasaklanır.' },
            { name: '🔹 Whitelistli Botlar', value: 'Güvenli listeye eklenmiş botlara izin verilir.' }
          )
          .setFooter({
            text: `Durum: ${config.guardSettings.botAddProtection ? '✅ Aktif' : '❌ Devre Dışı'} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
        
      case 'help_spam_protection':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard - Spam Koruması')
          .setColor('#FF5733')
          .setDescription('Gelişmiş spam koruması sistemi kullanıcıların flood, spam ve raid faaliyetlerini engeller.')
          .addFields(
            { name: '🔹 Mesaj Hızı Kontrolü', value: 'Çok kısa sürede çok sayıda mesaj gönderen kullanıcılar tespit edilir.' },
            { name: '🔹 Tekrarlayan Mesaj Tespiti', value: 'Aynı mesajı tekrar tekrar gönderen kullanıcılar tespit edilir.' },
            { name: '🔹 Aşırı Etiketleme Koruması', value: 'Tek mesajda çok fazla kullanıcı etiketlenmesini engeller.' },
            { name: '🔹 Aşırı Emoji Koruması', value: 'Tek mesajda çok fazla emoji kullanımı tespit edilir.' },
            { name: '🔹 Otomatik Cezalandırma', value: 'Tekrarlayan ihlallerde kullanıcılar otomatik olarak timeout alır.' }
          )
          .setFooter({
            text: `Durum: ${config.guardSettings.spamProtection ? '✅ Aktif' : '❌ Devre Dışı'} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
        
      case 'help_ad_protection':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard - Reklam Engelleme')
          .setColor('#8E44AD')
          .setDescription('Gelişmiş reklam engelleme sistemi sunucudaki farklı reklam türlerini tespit eder ve engeller.')
          .addFields(
            { name: '🔹 Discord Davet Linki Koruması', value: 'Diğer Discord sunucularına ait davet linklerini engeller.' },
            { name: '🔹 Sosyal Medya Reklamı Tespiti', value: 'Sosyal medya platformlarına ait reklam içeren mesajları engeller.' },
            { name: '🔹 Website Reklamı Tespiti', value: 'Web sitesi reklamlarını tespit eder ve engeller.' },
            { name: '🔹 Sunucu Reklamı Tespiti', value: 'Diğer sunucu/grup/topluluk reklamlarını tespit eder.' },
            { name: '🔹 Ticari/Satış Reklamı Tespiti', value: 'Satış, ticaret ve hizmet reklamlarını tespit eder.' },
            { name: '🔹 Kısaltılmış URL Tespiti', value: 'Kısa URL servisleri ile oluşturulmuş linkleri tespit eder.' },
            { name: '🔹 Whitelist Sistemi', value: 'Güvenilir sitelere ait linkler (örn. YouTube, GitHub) engellenmez.' },
            { name: '🔹 Otomatik Timeout', value: 'Tekrarlı ihlallerde kullanıcılar otomatik olarak timeout alır.' }
          )
          .setFooter({
            text: `Durum: ${config.guardSettings.adBlockProtection ? '✅ Aktif' : '❌ Devre Dışı'} | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
        
      case 'help_other_protection':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard - Diğer Korumalar')
          .setColor('#1abc9c')
          .setDescription('Sunucunuz için ek koruma sistemleri.')
          .addFields(
            { name: '🔹 Webhook Koruması', value: 'İzinsiz webhook oluşturmayı ve kullanmayı engeller.' },
            { name: '🔹 Emoji Koruması', value: 'Emojilerin silinmesini, değiştirilmesini veya izinsiz eklenmesini engeller.' },
            { name: '🔹 Raid Koruması', value: 'Sunucunuza ani üye girişi olduğunda harekete geçer.' },
            { name: '🔹 @everyone/@here Koruması', value: 'Yetkisiz kişilerin @everyone/@here kullanmasını engeller.' },
            { name: '🔹 Spam Koruması', value: `Çeşitli spam türlerini tespit eder ve engeller. (${config.guardSettings.spamProtection ? '✅ Aktif' : '❌ Devre Dışı'})` },
            { name: '🔹 Reklam Engelleme', value: `Gelişmiş reklam tespiti ve engelleme. (${config.guardSettings.adBlockProtection ? '✅ Aktif' : '❌ Devre Dışı'})` }
          )
          .setFooter({
            text: 'Çeşitli koruma sistemleri | Developed by Krex',
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
        
      case 'help_commands':
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard - Komutlar')
          .setColor('#2ecc71')
          .setDescription('Kullanabileceğiniz tüm slash komutları.')
          .addFields(
            { name: '`/yardım`', value: 'Bu yardım menüsünü görüntüler.' },
            { name: '`/whitelist ekle`', value: 'Güvenli listeye kullanıcı ekler. (Sadece bot sahipleri)' },
            { name: '`/whitelist çıkar`', value: 'Güvenli listeden kullanıcı çıkarır. (Sadece bot sahipleri)' },
            { name: '`/whitelist liste`', value: 'Güvenli listeyi görüntüler. (Sadece bot sahipleri)' },
            { name: '`/koruma ayarlar`', value: 'Koruma sistemlerini açıp kapatmanızı sağlar. (Sadece bot sahipleri)' },
            { name: '`/log-kanal`', value: 'Log kanalını ayarlamanızı sağlar. (Sadece yöneticiler)' }
          )
          .setFooter({
            text: `${interaction.guild.name} | Prefix: / (Slash Commands) | Developed by Krex`,
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
        
      default:
        responseEmbed = new EmbedBuilder()
          .setTitle('🛡️ KWI Guard Bot - Yardım Menüsü')
          .setDescription('Bir hata oluştu. Lütfen tekrar deneyin.')
          .setColor('#FF0000')
          .setFooter({
            text: 'Developed by Krex',
            iconURL: interaction.guild.iconURL({ dynamic: true })
          });
        break;
    }
    
    await interaction.update({ embeds: [responseEmbed] });
  }
};