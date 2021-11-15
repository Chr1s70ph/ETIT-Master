import { MessageEmbed, Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'say'

exports.description = 'Der Bot sagt, was man ihm sagt, dass er sagen soll, weil er dir nach sagt.'

exports.usage = 'say <messageContent>'

exports.run = (client: DiscordClient, message: Message) => {
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return client.commandReplyPromise(message, { content: 'You do not have the permissions to perform that command.' })
  }

  const messageContent = message.content.substring(message.content.indexOf(' ') + client.config.prefix.length)

  const embed = new MessageEmbed()
    .setDescription(messageContent === `${client.config.prefix}say` ? '᲼' : messageContent)
    .setColor('RANDOM')

  const messageAttachment = message.attachments.size > 0 ? message.attachments.first().url : null
  embed.setImage(messageAttachment)

  if (message.type === 'REPLY') {
    return message.channel.messages
      .fetch(message.reference.messageId)
      .then(_message => client.commandReplyPromise(message, { embeds: [embed] }, _message))
  }
  return client.commandSendPromise(message, { embeds: [embed] })
}
