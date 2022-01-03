import { MessageEmbed } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../types/customTypes'
const tx2 = require('tx2')

/**
 * Custom PM2 metric.
 */
const commandsCounter = tx2.counter({
  name: 'Commands used',
})

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Only respond to messages sent by users.
   */
  if (message.author.bot) return

  /**
   * DM handling and forwarding.
   */
  if (message.guildId === null) {
    dmForwarding(message, client)
  }

  /**
   * Command handling, only if message starts with defined prefix.
   */
  if (message.content.startsWith(client.config.prefix)) {
    /**
     * Get information about user selected command.
     */
    const { commandfile, args, commandName } = getCommandData(message, client)

    /**
     * If the command the user issued does not exist, simply ignore the input.
     */
    if (commandfile === undefined) return

    /**
     * Get language for user.
     */
    client.getLanguage(message)

    /**
     * Run the command.
     */
    executeCommand(message, commandfile, client, args, commandName)
  }
}

/**
 * Forwards all messages sent to the bot in private chats to Christoph.
 * @param {Message<boolean>} message Message sent by user
 * @param {DiscordClient} client Bot-Client
 */
function dmForwarding(message: DiscordMessage, client: DiscordClient): void {
  /**
   * Payload containing info about the user and the message he sent.
   */
  const messagePayload = {
    type: 'USER_DM',
    user: message.author,
    content: message.content,
    sticker: message.stickers.size > 0 ? message.stickers.first() : null,
    attachments: message.attachments.size > 0 ? message.attachments.first().url : null,
  }

  /**
   * Embed containing all the information from {@link messagePayload}.
   */
  const userMessage = userMessageEmbed(message, messagePayload)

  try {
    /**
     * Send {@link userMessage} to Christoph.
     */
    client.users.fetch(client.config.ids.acceptedAdmins.Christoph).then(user => {
      user.send({ embeds: [userMessage] })
    })
    console.log(messagePayload)
  } catch (error) {
    /**
     * Error handling.
     */
    throw new Error(error)
  }
}

/**
 * Turns {@link messagePayload} in an Embed.
 * @param {Message<boolean>} message Message sent by the user
 * @param {any} messagePayload {@link messagePayload}
 * @returns {MessageEmbed}
 */
function userMessageEmbed(message: DiscordMessage, messagePayload: any): MessageEmbed {
  /**
   * Return {@link MessageEmbed} with information about the user and what he sent.
   */
  return new MessageEmbed()
    .setDescription(
      message.content +
        (messagePayload.sticker !== null
          ? `${`\n${message.content ? 'and' : 'Sent'} a sticker: + **`}${messagePayload.sticker.name}**`
          : ''),
    )
    .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() })
    .setImage(messagePayload.attachments)
}

/**
 * Get information about the selected command.
 * @param {Message<boolean>} message Message sent by the user
 * @param {DiscordClient} client Bot-Client
 * @returns {string}
 */
function getCommandData(
  message: DiscordMessage,
  client: DiscordClient,
): { commandfile: any; args: string[]; commandName: string } {
  /**
   * Message sent by the user cut down in an Array.
   */
  const messageArray = message.content.split(' ')

  /**
   * {@link messageArray} without the command name.
   */
  const args = messageArray.slice(1)

  /**
   * Name of the selected command.
   */
  const commandName = messageArray[0].slice(client.config.prefix.length).toLowerCase()

  /**
   * File containing {@link command}.
   */
  const commandfile =
    client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  /**
   * Return information about the selected command.
   */
  return { commandfile, args, commandName }
}

/**
 * @param {DiscordMessage} message Message sent by the user
 * @param {any} commandfile Selected command
 * @param {DiscordClient} client Bot-Client
 * @param {string[]} args Arguments used by the user
 * @param {string} commandName Name of the selected command
 * @param {string} language Language for user
 * @returns {void}
 */
function executeCommand(
  message: DiscordMessage,
  commandfile: any,
  client: DiscordClient,
  args: string[],
  commandName: string,
): void {
  try {
    /**
     * Send typing to indicate that the bot is processing the command response.
     */
    message.channel.sendTyping()

    /**
     * Runs the selected command.
     * Delete the message issuing the command after it replied successfully.
     */
    commandfile.run(client, message, args)?.then(msg => {
      if (msg?.deletable) msg?.delete()
    })

    /**
     * Increment the counter of issued commands since last restart.
     */
    commandsCounter.inc()

    /**
     * Logging that a {@link GuildMember} used a command.
     */
    console.log(`${message.author.username} used ${commandName} ${args.length > 0 ? `with arguments: ${args}` : ''}`)
  } catch (error) {
    /**
     * Error handling.
     */
    throw new Error(error)
  }
}
