# 🛡️ Guard Bot

Guard Bot, Discord sunucunuz için geliştirilmiş kapsamlı bir koruma ve güvenlik sistemidir. Yetkisiz işlemlere karşı sunucunuzu güvende tutar ve tüm koruma işlemlerini detaylı olarak loglar.

## ✨ Özellikler

### 1. **Rol Koruması**
- Rollerin izinsiz silinmesine karşı koruma
- Rol izinlerinin izinsiz değiştirilmesine karşı koruma
- Rollerin izinsiz oluşturulmasına karşı koruma
- Silinen rolleri otomatik olarak geri oluşturma

### 2. **Kanal Koruması**
- Kanalların izinsiz silinmesine karşı koruma
- Kanal izinlerinin ve ayarlarının izinsiz değiştirilmesine karşı koruma
- Kanalların izinsiz oluşturulmasına karşı koruma
- Silinen kanalları otomatik olarak geri oluşturma

### 3. **Emoji Koruması**
- Emojilerin izinsiz silinmesine karşı koruma
- Emojilerin izinsiz eklenmesine karşı koruma

### 4. **Sunucu Ayar Koruması**
- Sunucu isminin, ikonunun ve banner'ının izinsiz değiştirilmesine karşı koruma
- Genel sunucu ayarlarının izinsiz değiştirilmesine karşı koruma

### 5. **Ban/Kick Koruması**
- Yetkisiz atılan ban ve kick işlemlerinin engellenmesi
- İzinsiz işlem yapan kullanıcıların cezalandırılması

### 6. **Bot Ekleme Koruması**
- Yetkisiz kişilerin sunucuya bot eklemesinin engellenmesi
- İzinsiz eklenen botların otomatik olarak sunucudan atılması

### 7. **Webhook Koruması**
- İzinsiz webhook oluşturulmasının engellenmesi
- Zararlı webhook mesajlarının kontrolü ve temizlenmesi

### 8. **Raid Koruması**
- Ani üye girişlerinin tespiti ve raid modu
- Raid süresince yeni gelen üyelerin otomatik olarak zaman aşımına alınması

### 9. **Everyone/Here Koruması**
- Yetkisiz kişilerin @everyone ve @here etiketlerini kullanmasının engellenmesi

### 10. **Spam Koruması**
- Kısa sürede çok fazla mesaj gönderen kullanıcıların tespiti
- Spam yapan kullanıcılara otomatik uyarı ve ceza sistemi

### 11. **Reklam Engelleme**
- Discord sunucu davetlerinin engellenmesi
- URL ve diğer reklam içeriklerinin tespiti ve engellenmesi

### 12. **Rol Dağıtım Koruması**
- Yetkisiz rol dağıtımının engellenmesi

## 🔧 Kurulum

1. `config.json` dosyasını aşağıdaki bilgilerle doldurun:

```json
{
  "token": "BOT_TOKEN",
  "clientId": "BOT_CLIENT_ID",
  "serverId": "SERVER_ID",
  "owners": ["SAHIP_ID_1", "SAHIP_ID_2"],
  "mongoURI": "MONGODB_URI",
  "logChannelId": "LOG_KANAL_ID",
  "defaultPrefix": "!",
  "guardSettings": {
    "roleProtection": true,
    "channelProtection": true,
    "emojiProtection": true,
    "guildUpdateProtection": true,
    "banKickProtection": true,
    "botAddProtection": true,
    "webhookProtection": true,
    "roleDistributionProtection": true,
    "raidProtection": true,
    "everyoneHereProtection": true,
    "spamProtection": true,
    "adBlockProtection": true
  },
  "whitelist": []
}
```

2. Gerekli paketleri yükleyin:
```bash
npm install
```
veya Windows için hazır olan kurulum dosyasını çalıştırın:
```
install.bat
```

3. Botu başlatın:
```bash
npm start
```
veya Windows için hazır olan başlatma dosyasını çalıştırın:
```
start.bat
```

## 📜 Komutlar

### Admin Komutları
- `/yardım` - Bot özellikleri ve komutları hakkında detaylı bilgi verir
- `/koruma ayarlar` - Tüm koruma sistemlerini açıp kapatmanızı sağlar
- `/whitelist ekle <kullanıcı>` - Güvenli listeye kullanıcı ekler
- `/whitelist çıkar <kullanıcı>` - Güvenli listeden kullanıcı çıkarır
- `/whitelist liste` - Güvenli listeyi görüntüler
- `/log-kanal <kanal>` - Koruma sistemi log kanalını ayarlar
- `/give-all <rol>` - Seçilen rolü sunucudaki tüm üyelere verir

## ⚙️ Ayarlar

Koruma sistemleri, `/koruma ayarlar` komutu ile açılıp kapatılabilir. Tüm koruma sistemleri varsayılan olarak açıktır. Bot ayarları şunları içerir:

- **Rol Koruması**: Rol silme, düzenleme ve oluşturma işlemleri için koruma
- **Kanal Koruması**: Kanal silme, düzenleme ve oluşturma işlemleri için koruma
- **Emoji Koruması**: Emoji ekleme ve silme işlemleri için koruma
- **Sunucu Koruması**: Sunucu ayarlarının değiştirilmesi işlemleri için koruma
- **Ban/Kick Koruması**: İzinsiz atılan ban ve kick işlemleri için koruma
- **Bot Koruması**: İzinsiz bot ekleme işlemleri için koruma
- **Webhook Koruması**: İzinsiz webhook oluşturma işlemleri için koruma
- **Rol Dağıtım Koruması**: İzinsiz rol dağıtma işlemleri için koruma
- **Raid Koruması**: Sunucuya ani üye girişlerine karşı koruma
- **Everyone/Here Koruması**: İzinsiz @everyone/@here etiketleme işlemleri için koruma
- **Spam Koruması**: Spam mesajlara karşı koruma
- **Reklam Engelleme**: Reklam içerikli mesajları engelleme

## 📋 Whitelist Sistemi

Whitelist listesinde bulunan kullanıcılar, tüm koruma sistemlerinden muaftır ve sunucuda her türlü değişikliği yapabilirler. Bu listeye sadece güvendiğiniz kişileri ekleyin.

Whitelist komutları:
- `/whitelist ekle <kullanıcı>` - Güvenli listeye kullanıcı ekler
- `/whitelist çıkar <kullanıcı>` - Güvenli listeden kullanıcı çıkarır
- `/whitelist liste` - Güvenli listeyi görüntüler

## 📊 Log Sistemi

Bot, tüm güvenlik olaylarını ayarladığınız log kanalına gönderir. Log kanalı ayarlamak için:
- `/log-kanal <kanal>` komutunu kullanın

Log mesajları şu bilgileri içerir:
- İşlemi yapan kullanıcı bilgisi
- İşlemin türü ve detayları
- Alınan önlemler ve yapılan işlemler

## 🚫 Ceza Sistemi

Bot, izinsiz işlem yapan kullanıcıları 3 aşamalı bir ceza sistemi ile takip eder:
1. İlk izinsiz işlemde kullanıcı uyarılır
2. İkinci izinsiz işlemde kullanıcı tekrar uyarılır
3. Üçüncü izinsiz işlemde kullanıcı sunucudan yasaklanır

Bu sistem 24 saat içinde yapılan işlemleri sayar, 24 saat geçtikten sonra sayaç sıfırlanır.

## 🛠️ Geliştiriciler

- krexdll (Discord) - [Ulas Bana](https://discord.com/users/1012249571436548136)

## 📅 Güncelleme Notları

**Son Güncelleme: Mayıs 2025**
- `/give-all` komutu eklendi
- Spam koruma sistemi geliştirildi
- Reklam engelleme sistemi eklendi
- Rol dağıtım koruması eklendi
- Genel performans iyileştirmeleri yapıldı

## 📝 Lisans ve Kullanım Bilgileri

### Lisans
Bu yazılım ISC Lisansı altında dağıtılmaktadır. Bu, aşağıdakilere izin verir:
- Yazılımı kopyalama
- Yazılımı değiştirme
- Yazılımı dağıtma
- Yazılımı ticari amaçlarla kullanma

Tek şart, telif hakkı bildirimi ve izin bildiriminin yazılımın tüm kopyalarında veya önemli parçalarında korunmasıdır.

### AI Kullanımı
Bu projenin bazı bölümlerinde yapay zeka teknolojileri kullanılmıştır:
- `src/utils/spamProtection.js` - Spam algılama algoritması geliştirilmesi
- `src/utils/adBlockUtils.js` - Reklam tespit mekanizmaları
- Dokümantasyon ve yardım içerikleri
- Kod optimizasyonu ve hata ayıklama süreçleri

© 2025 Krex. Tüm hakları saklıdır.
