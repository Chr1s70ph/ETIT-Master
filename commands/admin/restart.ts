import { Message } from 'discord.js'
import { connect, restart } from 'pm2'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'restart'

exports.description = ''

exports.usage = 'restart'

exports.run = (client: DiscordClient, message: Message) => {
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return message.reply('You do not have the permissions to perform that command.')
  }

  message.channel.send('🤖Restarting...')
  return connect(err => {
    if (err) {
      console.error(err)
      process.exit(2)
    }

    restart(process.env.pm_id, null)
  })
}
