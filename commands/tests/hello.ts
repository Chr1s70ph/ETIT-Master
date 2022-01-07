import { DiscordClient, DiscordMessage } from '../../types/customTypes'

exports.name = 'hello'

exports.description = 'Hallo welt!'

exports.usage = 'hello'

exports.aliases = ['hallo']

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  const returnString = client.translate({ key: 'commands.tests.hello.welcome', lng: message.author.language })

  return client.reply(message, { content: returnString })
}
