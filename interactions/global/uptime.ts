import { EmbedBuilder } from 'discord.js'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('uptime')
  .setDescription('How long is this bot already running...?')
  .setLocalizations('uptime')

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  const uptime = getUptime()

  /**
   * Build Embed to send back.
   */
  const uptime_embed = new EmbedBuilder()
    .setTitle(client.translate({ key: 'interactions.uptime.Title', options: { lng: interaction.user.language } }))
    .addFields([
      {
        name: client.translate({ key: 'interactions.uptime.Time', options: { lng: interaction.user.language } }),
        value: client.translate({
          key: 'interactions.uptime.Info',
          options: {
            days: uptime.days,
            hours: uptime.hours,
            minutes: uptime.minutes,
            seconds: uptime.seconds,
            lng: interaction.user.language,
          },
        }),
      },
    ])
    .setColor('#FF4040')

  await interaction.reply({ embeds: [uptime_embed], ephemeral: true })
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
