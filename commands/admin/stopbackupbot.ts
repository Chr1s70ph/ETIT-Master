import { Message } from 'discord.js'
import { connect, stop } from 'pm2'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'stopbackupbot'

exports.description = 'stops backup bot'

exports.usage = 'stopbackupbot'

exports.run = (client: DiscordClient, message: Message) => {
  if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id)) {
    return message.reply('You do not have the permissions to perform that command.')
  }

  message.channel.send('Stopping Backup Bot...')
  return connect(err => {
    if (err) {
      console.error(err)
      process.exit(2)
    }

    stop('ETIT-Chef', null)
  })
}
