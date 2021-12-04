import { Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
/**
 * Const required, otherwise pm2 throws an error.
 */
const pm2 = require('pm2')

exports.name = 'stopbackupbot'

exports.description = 'stops backup bot'

exports.usage = 'stopbackupbot'

exports.run = (client: DiscordClient, message: Message) => {
  /**
   * Check if user has the correct rights to execute the command
   */
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return client.reply(message, { content: 'You do not have the permissions to perform that command.' })
  }

  pm2Handle()
  return client.send(message, { content: 'Stopping Backup Bot...' })
}

/**
 * Pm2 restart handler.
 * @description Connect to the pm2 interface and stops the backup process.
 */
function pm2Handle(): void {
  pm2.connect(err => {
    if (err) {
      throw new Error(err)
    }
    try {
      pm2.stop('ETIT-Chef', null)
    } catch (error) {
      throw new Error(error)
    }
  })
}
