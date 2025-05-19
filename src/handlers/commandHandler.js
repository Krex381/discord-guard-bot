const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

module.exports = async (client) => {
  const commands = [];
  client.slashCommands = new Collection();

  
  const foldersPath = path.join(__dirname, '../commands');
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      
      if ('data' in command && 'execute' in command) {
        client.slashCommands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`[KOMUT] ${command.data.name} komutu yüklendi.`);
      } else {
        console.log(`[UYARI] ${filePath} komut dosyasında 'data' veya 'execute' eksik.`);
      }
    }
  }

  
  client.once('ready', async () => {
    try {
      console.log(`${commands.length} adet slash komut yüklenmeye başlanıyor...`);
      
      const rest = new REST({ version: '10' }).setToken(config.token);
      
      const data = await rest.put(
        Routes.applicationCommands(config.clientId),
        { body: commands },
      );

      console.log(`${data.length} adet slash komut başarıyla yüklendi.`);
    } catch (error) {
      console.error('Slash komutlar yüklenirken bir hata oluştu:', error);
    }
  });
};