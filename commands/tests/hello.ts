import { Message } from 'discord.js'

import { DiscordClient } from '../../types/customTypes'

exports.name = 'hello'

exports.description = 'Hallo welt!'

exports.usage = 'hello'

exports.aliases = ['hallo']

exports.run = (client: DiscordClient, message: Message, language: string) => {
  const returnString = client.translate({ key: 'devtest.welcome', lng: language })

  return client.reply(message, { content: returnString })
}
