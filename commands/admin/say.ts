import { MessageEmbed, Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'say'

exports.description = 'Der Bot sagt, was man ihm sagt, dass er sagen soll, weil er dir nach sagt.'

exports.usage = 'say <messageContent>'

exports.run = (client: DiscordClient, message: Message) => {
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return client.reply(message, { content: 'You do not have the permissions to perform that command.' })
  }

  const embed = createEmbed(message, client)

  if (message.type === 'REPLY') {
    return client.reply(message, { embeds: [embed] })
  }
  return client.send(message, { embeds: [embed] })
}

function createEmbed(message: Message<boolean>, client: DiscordClient): MessageEmbed {
  const messageContent = message.content.substring(message.content.indexOf(' ') + client.config.prefix.length)

  const embed = new MessageEmbed()
    .setDescription(messageContent === `${client.config.prefix}say` ? '᲼' : messageContent)
    .setColor('RANDOM')

  const messageAttachment = message.attachments.size > 0 ? message.attachments.first().url : null
  embed.setImage(messageAttachment)
  return embed
}
