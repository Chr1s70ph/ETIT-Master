import { DiscordClient, DiscordMessage } from '../../types/customTypes'
exports.name = 'ping'

exports.description = 'pong'

exports.usage = 'ping'

exports.run = (client: DiscordClient, message: DiscordMessage) =>
  /**
   * Send reply with API latency.
   */
  client.send(message, {
    content: client.translate({
      key: 'commands.utility.ping',
      options: {
        latency: Date.now() - message.createdTimestamp,
        api_latency: Math.round(client.ws.ping),
        lng: message.author.language,
      },
    }),
  })
