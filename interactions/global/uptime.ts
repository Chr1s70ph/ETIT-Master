import { EmbedBuilder, MessageFlags } from 'discord.js'
import project from '../../package.json'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../../types/customTypes'
const os = require('os')
const newLocal = 'child_process'
const latest_commit = require(newLocal).execSync('git rev-parse HEAD').toString().substring(0, 7)

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
        inline: true,
      },
      {
        name: 'Discord.js:',
        value: `v${project.dependencies['discord.js'].slice(1)}`,
        inline: true,
      },
      {
        name: '‎',
        value: '‎',
        inline: true,
      },
    ])
    .addFields([
      {
        name: 'OS:',
        value: `${os.type()} ${os.release()}`,
        inline: true,
      },
      {
        name: 'NodeJs:',
        value: `${process.version}`,
        inline: true,
      },
      {
        name: 'Latest git Commit:',
        value: `[\`${latest_commit}\`](https://github.com/Chr1s70ph/ETIT-Master/commit/${latest_commit})`,
        inline: true,
      },
    ])
    .setColor('#FF4040')

  await interaction.reply({ embeds: [uptime_embed], flags: MessageFlags.Ephemeral })
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
