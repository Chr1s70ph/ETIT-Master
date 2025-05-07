import { EmbedBuilder, MessageFlags } from 'discord.js'
import moment from 'moment-timezone'
import { extractZoomLinks, filterEvents } from '../../types/calendar_helper_functions'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../../types/customTypes'

exports.name = 'klausuren'

exports.description = '️Zeigt deine anstehenden Klausuren an.'

exports.usage = `klausuren`

export const data = new DiscordSlashCommandBuilder()
  .setName('klausuren')
  .setDescription('Zeigt deine anstehenden Klausuren an.')
  .setLocalizations('klausuren')

function klausuren(client: DiscordClient, interaction: DiscordChatInputCommandInteraction, pNow) {
  let calendars_object = {}
  const calendars = client.calendars.values()
  for (const entry of calendars) {
    calendars_object = { ...calendars_object, ...entry }
  }

  const relevantEvents = []
  const curWeekday = pNow.getDay() === 0 ? 6 : pNow.getDay() - 1
  const startOfWeek = new Date(pNow.setDate(pNow.getDate() - curWeekday))
  startOfWeek.setHours(0, 0, 0)

  const rangeStart = moment(startOfWeek)
  const rangeEnd = rangeStart.clone().add(7, 'months')

  filterEvents(calendars_object, rangeStart, rangeEnd, interaction, relevantEvents, true)

  const embed = new EmbedBuilder()
    .setAuthor({
      name: client.translate({
        key: 'interactions.klausuren.Exams',
        options: {
          user: interaction.user.username,
          lng: interaction.user.language,
        },
      }),
    })
    .setColor('Aqua')

  const exams = {}

  for (const relevantEvent of relevantEvents) {
    if (typeof relevantEvent.start.tz === 'undefined') {
      const tzOffset = moment().tz('Europe/Berlin').utcOffset()
      relevantEvent.start.setMinutes(relevantEvent.start.getMinutes() + tzOffset)
      relevantEvent.end.setMinutes(relevantEvent.end.getMinutes() + tzOffset)
    }

    if (!exams[relevantEvent.start]) {
      exams[relevantEvent.start] = []
    }
    exams[relevantEvent.start].push(relevantEvent)
  }

  moment.locale(interaction.user.language)

  for (const exam of Object.keys(exams)) {
    let examItem = exams[exam]
    examItem = examItem.sort((a, b) => moment(a.start).hours() - moment(b.start).hours())

    const name = examItem[0].start.toLocaleDateString(interaction.user.language)
    let value = ''

    for (const weekdayEvent of examItem) {
      value += `\`${moment(weekdayEvent.start).format('HH:mm')} - ${moment(weekdayEvent.end).format('HH:mm')}\` ${
        weekdayEvent.summary
      }  [[Maps](https://www.google.com/maps/search/KIT+${encodeURIComponent(weekdayEvent.location)}/)]`
      if (weekdayEvent.description.indexOf('https://kit-lecture.zoom.us') !== -1) {
        value += ` [[Zoom](${extractZoomLinks(weekdayEvent.description)})]`
      }
      value += '\n'
    }
    embed.addFields({ name: name, value: value, inline: false })
  }

  return embed
}

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
  const now = new Date()
  const embed = await klausuren(client, interaction, now)

  await interaction.editReply({
    embeds: [embed],
  })
}
