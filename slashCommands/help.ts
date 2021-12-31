import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
const fs = require('fs')

export const data = new SlashCommandBuilder().setName('help').setDescription('hilfe ist hier')

exports.respond = async (client, interaction: any): Promise<void> => {
  const embed = await getCommands(client)
  console.log(`User ${interaction.user.username} issued /help`)
  await interaction.reply({ embeds: [embed.setTimestamp()], ephemeral: true })
}

async function getCommands(client): Promise<any> {
  const commandsEmbed = new MessageEmbed()
    .setColor('#ffa500')
    .setAuthor({ name: 'Help', iconURL: 'https://bit.ly/3CJU0lf' })
    .setTimestamp()
    .setFooter({
      text: `[ID] ${client.config.ids.userID.botUserID} \nstarted`,
      iconURL: 'https://image.flaticon.com/icons/png/512/888/888879.png',
    })

  const commandFiles = await fs.promises.readdir('./commands/', null)

  for (const file of commandFiles) {
    const element_in_folder = fs.statSync(`./commands/${file}`)
    if (element_in_folder.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      await addCommandsFromSubFolder(commandsEmbed, file)
    }
  }
  return commandsEmbed
}

async function addCommandsFromSubFolder(_commandsEmbed, file): Promise<void> {
  const sub_directory = `./commands/${file}/`
  try {
    const files = await fs.promises.readdir(sub_directory)
    let commandsInSubfolder = ' '
    for (const command of files) {
      const slicedFileName = command.split('.ts')[0]
      commandsInSubfolder += `${slicedFileName}\n`
    }
    _commandsEmbed.addFields({
      name: file,
      value: commandsInSubfolder,
      inline: true,
    })
  } catch (e) {
    console.log(e)
  }
}
