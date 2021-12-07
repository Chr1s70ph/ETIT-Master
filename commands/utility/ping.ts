import { Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'ping'

exports.description = 'pong'

exports.usage = 'ping'

exports.run = (client: DiscordClient, message: Message) =>
  /**
   * Send reply with API latency.
   */
  client.send(message, {
    content: `🏓Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`,
  })
