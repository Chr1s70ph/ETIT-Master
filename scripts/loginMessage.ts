import { statSync, readdir } from 'fs'
import { readdir as readdir_promise } from 'fs/promises'
import { MessageEmbed, TextChannel } from 'discord.js'
import project from '../package.json'
import { DiscordClient } from '../types/customTypes'
const os = require('os')

exports.run = async (client: DiscordClient) => {
  const commands = []
  await commandCounter(commands)

  const slashCount = await readdir_promise('./slashCommands')

  const loginMessage = createEmbed(client, commands, slashCount)

  const channel = client.channels.cache.find(
    _channel => _channel.id === client.config.ids.channelIDs.dev.botTestLobby,
  ) as TextChannel
  channel.send({ embeds: [loginMessage] })
}

function createEmbed(client: DiscordClient, commands: any[], slashCount: string[]): MessageEmbed {
  return new MessageEmbed()
    .setColor('#ffa500')
    .setAuthor({ name: client.user.tag, iconURL: 'https://www.iconsdb.com/icons/preview/orange/code-xxl.png' })
    .setThumbnail(client.user.avatarURL())
    .setTitle('[🌐] Bot erfolgreich gestartet')
    .addFields(
      {
        name: 'OS:',
        value: `${os.type()} ${os.release()}`,
        inline: true,
      },
      {
        name: 'NodeJs:',
        value: `${process.version}`,
        inline: true,
      },
      {
        name: 'Discord.js:',
        value: `v${project.dependencies['discord.js'].slice(1)}`,
        inline: true,
      },
    )
    .addFields(
      {
        name: 'Befehle geladen:',
        value: commands.length.toString(),
        inline: true,
      },
      {
        name: 'SlashCommands geladen:',
        value: slashCount.length.toString(),
        inline: true,
      },
      {
        name: 'Scheduler:',
        value: 'geladen',
        inline: true,
      },
    )
    .setTimestamp()
    .setFooter(
      `[ID] ${client.config.ids.userID.botUserID} \nstarted`,
      'https://image.flaticon.com/icons/png/512/888/888879.png',
    )
}

async function commandCounter(commands: any[]): Promise<void> {
  const files = await readdir_promise('./commands')
  files.forEach(file => {
    const element_in_folder = statSync(`./commands/${file}`)
    if (element_in_folder.isDirectory() === true) {
      // Check if element is a folder
      const sub_directory = `./commands/${file}/`
      readdir(sub_directory, (err, elements) => {
        // Reads all subcommands
        if (err) return console.log(err)
        elements.forEach(element => {
          // Add command to commands array
          commands[commands.length] = element
        })
        return 0
      })
    } else {
      // Add command to commands array
      commands[commands.length] = file
    }
  })
}
