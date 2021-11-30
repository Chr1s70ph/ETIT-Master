import { MessageEmbed, Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'say'

exports.description = 'Der Bot sagt, was man ihm sagt, dass er sagen soll, weil er dir nach sagt.'

exports.usage = 'say <messageContent>'

exports.run = (client: DiscordClient, message: Message) => {
  /**
   * Check if user has the correct rights to execute the command
   */
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return client.reply(message, { content: 'You do not have the permissions to perform that command.' })
  }

  /**
   * Embed to send back
   */
  const embed = createEmbed(message, client)

  /**
   * Send reply based on message type
   */
  return message.type === 'REPLY'
    ? client.reply(message, { embeds: [embed] })
    : client.send(message, { embeds: [embed] })
}

/**
 *
 * @param {Message} message command Message
 * @param {DiscordClient} client Bot-Client
 * @returns {MessageEmbed} embed with given message.content
 */
function createEmbed(message: Message<boolean>, client: DiscordClient): MessageEmbed {
  const messageContent = message.content.substring(message.content.indexOf(' ') + client.config.prefix.length)

  const embed = new MessageEmbed()
    .setDescription(messageContent === `${client.config.prefix}say` ? '᲼' : messageContent)
    .setColor('RANDOM')

  const messageAttachment = message.attachments.size > 0 ? message.attachments.first().url : null
  embed.setImage(messageAttachment)
  return embed
}
