import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'test'

exports.description = 'Prüft ob der Bot online und funktionstüchtig ist.'

exports.usage = 'test'

exports.run = (client: DiscordClient, message: Message) =>
  client.reply(message, {
    embeds: [
      new MessageEmbed()
        .setTitle('🌐 This Bot is working as intended!')
        .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true })),
    ],
  })
