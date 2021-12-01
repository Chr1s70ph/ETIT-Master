import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'antwortaufalles'

exports.description = 'Was ist die Antwort auf alles?'

exports.usage = 'antwortaufalles'

exports.run = (client: DiscordClient, message: Message) =>
  /**
   * Reply with the anwer to everything.
   */
  client.reply(message, {
    embeds: [
      new MessageEmbed().setDescription(
        'Die Antwort auf die Frage nach dem Leben, dem Universum und dem ganzen Rest ist :four::two:',
      ),
    ],
  })
