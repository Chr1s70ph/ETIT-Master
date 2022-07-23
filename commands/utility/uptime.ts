import { EmbedBuilder } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'

exports.name = 'uptime'

exports.description = 'Wie lange ist der Bot schon online'

exports.usage = 'uptime'

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Uptime in days, hours, minutes and seconds.
   */
  const uptime = getUptime()

  /**
   * Send back reply with uptime.
   */
  return client.reply(message, {
    embeds: [
      new EmbedBuilder()
        .setTitle(client.translate({ key: 'commands.utility.uptime.Title', lng: message.author.language }))
        .addFields([
          {
            name: client.translate({ key: 'commands.utility.uptime.Time', lng: message.author.language }),
            value: client.translate({
              key: 'commands.utility.uptime.Info',
              options: {
                days: uptime.days,
                hours: uptime.hours,
                minutes: uptime.minutes,
                seconds: uptime.seconds,
                lng: message.author.language,
              },
            }),
          },
        ])
        .setColor('#FF4040'),
    ],
  })
}

/**
 *
 * @returns {uptime} uptime
 */
function getUptime(): uptime {
  const uptime = {
    days: null,
    hours: null,
    minutes: null,
    seconds: null,
  }

  /**
   * https://stackoverflow.com/a/36099084/10926046
   */
  uptime.seconds = parseInt(process.uptime().toString().split('.')[0])

  uptime.days = Math.floor(uptime.seconds / (3600 * 24))
  uptime.seconds -= uptime.days * 3600 * 24
  uptime.hours = Math.floor(uptime.seconds / 3600)
  uptime.seconds -= uptime.hours * 3600
  uptime.minutes = Math.floor(uptime.seconds / 60)
  uptime.seconds -= uptime.minutes * 60
  return uptime
}

/**
 * Interface for the uptime object.
 */
interface uptime {
  days: number
  hours: number
  minutes: number
  seconds: number
}
