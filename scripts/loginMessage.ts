import { statSync, readdir } from 'fs'
import { readdir as readdir_promise } from 'fs/promises'
import { EmbedBuilder, TextChannel } from 'discord.js'
import project from '../package.json'
import { DiscordClient } from '../types/customTypes'
const os = require('os')
const newLocal = 'child_process'
const latest_commit = require(newLocal).execSync('git rev-parse HEAD').toString().substring(0, 7)

exports.run = async (client: DiscordClient) => {
  /**
   * Array of commands.
   */
  const commands = []

  /**
   * Count commands.
   */
  await commandCounter(commands)

  /**
   * List of slashCommands.
   */
  const interactionCount = await readdir_promise('./interactions/')

  /**
   * Login message {@link EmbedBuilder}.
   */
  const loginMessage = createEmbed(client, commands, interactionCount)

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
 * @param {any[]} commands All commands
 * @param {string[]} slashCount All slashCommands
 * @returns {EmbedBuilder}
 */
function createEmbed(client: DiscordClient, commands: any[], slashCount: string[]): EmbedBuilder {
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
        name: 'Befehle geladen:',
        value: commands.length.toString(),
        inline: true,
      },
      {
        name: 'Interactions geladen:',
        value: slashCount.length.toString(),
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
 * Count commands.
 * @param {any[]} commands Array of commands
 * @returns {Promise}
 */
async function commandCounter(commands: any[]): Promise<void> {
  /**
   * Directory to count commands.
   */
  const directory = await readdir_promise('./commands')

  /**
   * Loop through all folders in {@link directory}.
   */
  directory.forEach(file => {
    /**
     * Check if elements in {@link directory} are folders.
     */
    if (statSync(`./commands/${file}`).isDirectory() === true) {
      /**
       * Sub directory to look for commands inside.
       */
      const sub_directory = `./commands/${file}/`

      /**
       * Read directory.
       */
      readdir(sub_directory, (err, elements) => {
        /**
         * Error handling.
         */
        if (err) return console.log(err)

        /**
         * Loop through all files in {@link sub_directory}.
         */
        elements.forEach(element => {
          /**
           * Add command to commands array
           */
          commands[commands.length] = element
        })
        return 0
      })
    } else {
      /**
       * Add command to commands array
       */
      commands[commands.length] = file
    }
  })
}
