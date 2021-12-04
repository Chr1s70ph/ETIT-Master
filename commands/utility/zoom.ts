import { Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'zoom'

exports.description = 'Schickt ein Emoji, das beschreibt, worin Zoom am besten ist...'

exports.usage = 'zoom'

exports.aliases = ['loading']

exports.run = (client: DiscordClient, message: Message) =>
  /**
   * Send back emoji relevant to zoom.
   */
  client.send(message, { content: '<a:loading:783688114509578271>' })
