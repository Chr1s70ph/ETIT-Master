import { EmbedBuilder } from 'discord.js'
import moment from 'moment-timezone'
import { async } from 'node-ical'
import { DiscordClient, DiscordChatInputCommandInteraction, DiscordSlashCommandBuilder } from '../../types/customTypes'

exports.name = 'klausuren'

exports.description = '️Zeigt deine anstehenden Klausuren an.'

exports.usage = `klausuren`

export const data = new DiscordSlashCommandBuilder()
  .setName('klausuren')
  .setDescription('Zeigt deine anstehenden Klausuren an.')
  .setLocalizations('klausuren')

async function klausuren(
  client: DiscordClient,
  interaction: DiscordChatInputCommandInteraction,
  pNow,
  pCourseAndSemester,
) {
  let returnData = {}
  for (const entry in client.config.calendars) {
    // eslint-disable-next-line no-await-in-loop
    returnData = { ...returnData, ...(await async.fromURL(client.config.calendars[entry])) }
  }

  const relevantEvents = []
  const curWeekday = pNow.getDay() === 0 ? 6 : pNow.getDay() - 1
  const startOfWeek = new Date(pNow.setDate(pNow.getDate() - curWeekday))
  startOfWeek.setHours(0, 0, 0)

  const rangeStart = moment(startOfWeek)
  const rangeEnd = rangeStart.clone().add(7, 'months')

  filterEvents(returnData, rangeStart, rangeEnd, pCourseAndSemester, interaction, relevantEvents)

  const embed = new EmbedBuilder().setAuthor({
    name: client.translate({
      key: 'interactions.klausuren.Exams',
      options: {
        user: interaction.user.username,
        lng: interaction.user.language,
      },
    }),
  })

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

function filterEvents(
  returnData: any,
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
  pCourseAndSemester: any,
  pMessageOrInteraction: any,
  relevantEvents: any[],
) {
  for (const i in returnData) {
    const event = returnData[i]
    if (returnData[i].type === 'VEVENT') {
      const title = event.summary
      const startDate = moment(event.start)
      const endDate = moment(event.end)
      const duration = parseInt(endDate.format('x')) - parseInt(startDate.format('x'))
      secondFIlter(
        event,
        startDate,
        rangeStart,
        rangeEnd,
        pCourseAndSemester,
        pMessageOrInteraction,
        title,
        relevantEvents,
        duration,
        endDate,
      )
    }
  }
}

function secondFIlter(
  event: any,
  startDate: any,
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
  pCourseAndSemester: any,
  pMessageOrInteraction: any,
  title: any,
  relevantEvents: any[],
  duration: number,
  endDate: any,
) {
  if (typeof event.rrule === 'undefined') {
    if (startDate.isBetween(rangeStart, rangeEnd) && title.toLowerCase().includes('klausur')) {
      pushToWeeksEvents(pMessageOrInteraction, event, relevantEvents)
    }
  } else {
    const dates = event.rrule.between(rangeStart.toDate(), rangeEnd.toDate(), true)

    if (event.recurrences !== undefined) {
      for (const recurrence in event.recurrences) {
        if (moment(new Date(recurrence)).isBetween(rangeStart, rangeEnd) !== true) {
          dates.push(new Date(recurrence))
        }
      }
    }

    for (const date of dates) {
      let curEvent = event
      let relevantRecurrence = true
      let curDuration = duration

      startDate = moment(date)

      const dateLookupKey = date.toISOString().substring(0, 10)

      if (curEvent.recurrences !== undefined && curEvent.recurrences[dateLookupKey] !== undefined) {
        curEvent = curEvent.recurrences[dateLookupKey]
        startDate = moment(curEvent.start)
        curDuration = parseInt(moment(curEvent.end).format('x')) - parseInt(startDate.format('x'))
      } else if (curEvent.exdate !== undefined && curEvent.exdate[dateLookupKey] !== undefined) {
        relevantRecurrence = false
      }

      endDate = moment(parseInt(startDate.format('x')) + curDuration, 'x')

      if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
        relevantRecurrence = false
      }

      if (relevantRecurrence === true && title.toLowerCase().includes('klausur')) {
        pushToWeeksEvents(pMessageOrInteraction, event, relevantEvents)
      }
    }
  }
}

function pushToWeeksEvents(interaction, event, relevantEvents) {
  const roles = interaction.member.roles.cache.map(role => role)
  for (const role in roles) {
    const searchQuery = event.summary.split('-')[1].split('(')[0].toLowerCase()
    if (roles[role].name.toLowerCase().trim() === searchQuery.toLowerCase().trim()) {
      relevantEvents.push(event)
    }
  }
}

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply({ ephemeral: true })
  const now = new Date()
  const embed = await klausuren(client, interaction, now, 'all')

  await interaction.editReply({
    embeds: [embed],
  })
}

/**
 * Extracts the zoom Links from HTML tag
 * if the HTML tag contains "#success" it cuts the string before that string, to make the link automatically open zoom
 * @param {string} eventLinkString string to extract link from
 * @returns {string} well formed url
 */
function extractZoomLinks(eventLinkString: string): string {
  if (eventLinkString.length === 0) return undefined

  /**
   * Extract link from href tag.
   */
  eventLinkString = eventLinkString.includes('<a href=')
    ? eventLinkString.split('<a href=')[1].split('>')[0]
    : eventLinkString

  /**
   * Strip all html tags and encode as URI.
   */
  const link = eventLinkString.replace(/(<.*?>)/g, '')

  /**
   * Remove "#success" string, to automatically open zoom.
   */
  return link.includes('#success') ? link.split('#success')[0] : link.includes('id=') ? link.split('id=')[0] : link
}
