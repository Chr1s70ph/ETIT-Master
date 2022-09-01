import { EmbedBuilder } from 'discord.js'
import { DiscordClient, DiscordCommandInteraction, DiscordSlashCommandBuilder } from '../types/customTypes'
const fs = require('fs')

export const data = new DiscordSlashCommandBuilder()
  .setName('help')
  .setDescription('hilfe ist hier')
  .setLocalizations('help')

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  const embed = await getCommands(client, interaction)
  await interaction.reply({ embeds: [embed.setTimestamp()], ephemeral: true })
}

async function getCommands(client: DiscordClient, interaction: DiscordCommandInteraction): Promise<any> {
  const commandsEmbed = new EmbedBuilder()
    .setColor('#ffa500')
    .setAuthor({
      name: client.translate({ key: 'interactions.help.title', lng: interaction.user.language }),
      iconURL: 'https://bit.ly/3CJU0lf',
    })
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

async function addCommandsFromSubFolder(embed: EmbedBuilder, file: string): Promise<void> {
  const sub_directory = `./commands/${file}/`
  try {
    const files = await fs.promises.readdir(sub_directory)
    let commandsInSubfolder = ' '
    for (const command of files) {
      const slicedFileName = command.split('.ts')[0]
      commandsInSubfolder += `${slicedFileName}\n`
    }
    embed.addFields({
      name: file,
      value: commandsInSubfolder,
      inline: true,
    })
  } catch (e) {
    console.log(e)
  }
}
