import { MessageEmbed } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'

exports.name = 'test'

exports.description = 'Prüft ob der Bot online und funktionstüchtig ist.'

exports.usage = 'test'

exports.run = (client: DiscordClient, message: DiscordMessage) =>
  /**
   * Send reply, that the bot is working as intended.
   */
  client.reply(message, {
    embeds: [
      new MessageEmbed()
        .setTitle(client.translate({ key: 'commands.utility.test', lng: message.author.language }))
        .setFooter({ text: message.author.tag, iconURL: message.author.avatarURL({ forceStatic: true }) }),
    ],
  })
