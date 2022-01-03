import { DiscordClient, DiscordMessage } from '../../types/customTypes'

/**
 * Const required, otherwise pm2 throws an error.
 */
const pm2 = require('pm2')

exports.name = 'restart'

exports.description = ''

exports.usage = 'restart'

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Check if user has the correct rights to execute the command.
   */
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return client.reply(message, {
      content: client.translate({ key: 'commands.admin.missingPermission', lng: message.author.language }),
    })
  }

  pm2Handle()
  return client.send(message, {
    content: client.translate({ key: 'commands.admin.restart', lng: message.author.language }),
  })
}

/**
 * Pm2 restart handler.
 * @description Connect to the pm2 interface and restarts the current process.
 */
function pm2Handle(): void {
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
}
