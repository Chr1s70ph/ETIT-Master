import { Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
// Const required, otherwise pm2 throws error
const pm2 = require('pm2')

exports.name = 'restart'

exports.description = ''

exports.usage = 'restart'

exports.run = (client: DiscordClient, message: Message) => {
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return client.commandReplyPromise(message, { content: 'You do not have the permissions to perform that command.' })
  }

  pm2.connect(err => {
    if (err) {
      throw new Error(err)
    }
    try {
      pm2.restart(process.env.pm_id, null)
    } catch (error) {
      throw new Error(error)
    }
  })
  return client.commandSendPromise(message, { content: '🤖Restarting...' })
}
