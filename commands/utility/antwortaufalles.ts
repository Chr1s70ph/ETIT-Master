import { MessageEmbed } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'

exports.name = 'antwortaufalles'

exports.description = 'Was ist die Antwort auf alles?'

exports.usage = 'antwortaufalles'

exports.run = (client: DiscordClient, message: DiscordMessage) =>
  /**
   * Reply with the anwer to everything.
   */
  client.reply(message, {
    embeds: [
      new MessageEmbed().setDescription(
        client.translate({ key: 'commands.utility.antwortaufalles', lng: message.author.language }),
      ),
    ],
  })
