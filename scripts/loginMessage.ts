import { PathLike, readdirSync, statSync } from 'fs'
import { EmbedBuilder, TextChannel } from 'discord.js'
import project from '../package.json'
import { DiscordClient } from '../types/customTypes'
const os = require('os')
const newLocal = 'child_process'
const path = require('path')

const latest_commit = require(newLocal).execSync('git rev-parse HEAD').toString().substring(0, 7)
const interactionFilesArray: Array<PathLike> = []

exports.run = (client: DiscordClient) => {
  /**
   * Login message {@link EmbedBuilder}.
   */
  const loginMessage = createEmbed(client)

  /**
   * Channel to send {@link loginMessage} to.
   */
  const channel = client.channels.cache.find(
    _channel => _channel.id === client.config.ids.channelIDs.dev.botTestLobby,
  ) as TextChannel

  /**
   * Send {@link loginMessage}.
   */
  channel.send({ embeds: [loginMessage] })
}

/**
 * Create loginmessage.
 * @param {DiscordClient} client Bot-Client
 * @returns {EmbedBuilder}
 */
function createEmbed(client: DiscordClient): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#ffa500')
    .setAuthor({ name: client.user.tag, iconURL: client.user.avatarURL() })
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
        name: 'Interactions geladen:',
        value: getAllFiles('./interactions/', interactionFilesArray).length.toString(),
        inline: true,
      },
      {
        name: 'Latest git Commit:',
        value: `[\`${latest_commit}\`](https://github.com/Chr1s70ph/ETIT-Master/commit/${latest_commit})`,
        inline: true,
      },
    )
    .setTimestamp()
    .setFooter({
      text: `[ID] ${client.config.ids.userID.botUserID} \nstarted`,
      iconURL: client.guilds.cache.find(guild => guild.id === client.config.ids.serverID).iconURL(),
    })
}

/**
 * Get number of files in directory including subdirectories
 * @param {PathLike} dirPath Path
 * @param {Array<PathLike>} arrayOfFiles Array of files in {@link dirPath}
 * @returns {Array<PathLike>}
 */
function getAllFiles(dirPath: PathLike, arrayOfFiles: any[]) {
  const files = readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(file => {
    if (statSync(`${dirPath}/${file}`).isDirectory()) {
      arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file))
    }
  })

  return arrayOfFiles
}
