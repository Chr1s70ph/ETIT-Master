import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'uptime'

exports.description = 'Wie lange ist der Bot schon online'

exports.usage = 'uptime'

exports.run = async (client: DiscordClient, message: Message) => {
  const uptime = {
    days: null,
    hours: null,
    minutes: null,
    seconds: null,
  }

  // https://stackoverflow.com/a/36099084/10926046
  uptime.seconds = process.uptime().toString().split('.')[0]

  uptime.days = Math.floor(uptime.seconds / (3600 * 24))
  uptime.seconds -= uptime.days * 3600 * 24
  uptime.hours = Math.floor(uptime.seconds / 3600)
  uptime.seconds -= uptime.hours * 3600
  uptime.minutes = Math.floor(uptime.seconds / 60)
  uptime.seconds -= uptime.minutes * 60

  return client.commandReplyPromise(message, {
    embeds: [
      new MessageEmbed()
        .setTitle('⏰Uptime')
        .addField(
          'Time since last restart:',
          `${uptime.days} Days, ${uptime.hours} Hours, ${uptime.minutes} Minutes, ${uptime.seconds} Seconds`,
        )
        .setColor('#FF4040'),
    ],
  })
}
