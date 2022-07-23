import { EmbedBuilder, Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'nice'

exports.description = 'nice'

exports.usage = 'nice'

exports.run = (client: DiscordClient, message: Message) =>
  client.reply(message, {
    embeds: [
      new EmbedBuilder().setImage('https://c.tenor.com/8mxM9CqBbqMAAAAd/wii-bowling.gif').setFooter({
        text: message.author.tag,
        iconURL: message.author.avatarURL(),
      }),
    ],
  })
