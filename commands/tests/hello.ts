import { Message } from 'discord.js'

import { DiscordClient } from '../../types/customTypes'

exports.name = 'devtest'

exports.description = 'Testfunktion von neuen Features'

exports.usage = 'devtest'

exports.aliases = ['hallo']

exports.run = (client: DiscordClient, message: Message, language: string) => {
  const returnString = client.translate({ key: 'devtest.welcome', lng: language })

  return client.reply(message, { content: returnString })
}
