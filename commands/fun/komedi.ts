import { EmbedBuilder, Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'komedi'

exports.description = 'Das Komedi Meme'

exports.usage = 'komedi'

exports.run = (client: DiscordClient, message: Message) =>
  /**
   * Send back the komedi meme.
   */
  client.send(message, {
    embeds: [
      new EmbedBuilder()
        .setImage('https://cdn.discordapp.com/attachments/768117219812835378/818145599894847488/eqmmb89gml941.png')
        .setFooter({
          text: message.author.tag,
          iconURL: message.author.avatarURL(),
        }),
    ],
  })
