import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
import moment from 'moment-timezone'
import { async } from 'node-ical'
import { DiscordClient, DiscordCommandInteraction } from '../types/customTypes'

exports.name = 'wochenplan'

exports.description = '️Zeigt den Wochenplan an.'

exports.usage = `wochenplan {TAG}`

export const data = new SlashCommandBuilder()
  .setName('wochenplan')
  .setDescription('Zeigt deinen Wochenplan an.')
  .addStringOption(option =>
    option.setName('datum').setDescription('Das Datum, das angezeigt werden soll. Format: DD.MM.YYYY'),
  )

async function wochenplan(client: DiscordClient, interaction: DiscordCommandInteraction, pNow, pCourseAndSemester) {
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
  const rangeEnd = rangeStart.clone().add(7, 'days')

  filterEvents(returnData, rangeStart, rangeEnd, pCourseAndSemester, interaction, relevantEvents)

  const embed = new MessageEmbed()
    .setAuthor({
      name: client.translate({
        key: 'interactions.wochenplan.Schedule',
        options: {
          user: interaction.user.username,
          lng: interaction.user.language,
        },
      }),
    })
    .setDescription(
      client.translate({
        key: 'interactions.wochenplan.Week',
        options: { date: moment(startOfWeek).format('DD.MM.yyyy'), lng: interaction.user.language },
      }),
    )

  const weekdayItems = {}

  for (const relevantEvent of relevantEvents) {
    if (typeof relevantEvent.start.tz === 'undefined') {
      const tzOffset = moment().tz('Europe/Berlin').utcOffset()
      relevantEvent.start.setMinutes(relevantEvent.start.getMinutes() + tzOffset)
      relevantEvent.end.setMinutes(relevantEvent.end.getMinutes() + tzOffset)
    }

    if (!weekdayItems[moment(relevantEvent.start).days()]) {
      weekdayItems[moment(relevantEvent.start).days()] = []
    }
    weekdayItems[moment(relevantEvent.start).days()].push(relevantEvent)
  }

  moment.locale(interaction.user.language)
  let embed_too_long = false

  for (const weekdayKey of Object.keys(weekdayItems)) {
    let weekdayItem = weekdayItems[weekdayKey]
    weekdayItem = weekdayItem.sort((a, b) => moment(a.start).hours() - moment(b.start).hours())

    const courseDate = moment(
      new Date(
        `${startOfWeek.getFullYear()}-${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')}-${(
          startOfWeek.getDate() +
          parseInt(weekdayKey) -
          1
        )
          .toString()
          .padStart(2, '0')}T00:00:00`,
      ),
    ).format('DD.MM.yyyy (dddd)')
    let body = ''

    for (const weekdayEvent of weekdayItem) {
      /**
       * Add Time and name of Course
       */
      body += `\`${moment(weekdayEvent.start).format('HH:mm')} - ${moment(weekdayEvent.end).format('HH:mm')}\` ${
        weekdayEvent.summary
      } `

      /**
       * Add Google Maps link if available
       */
      if (weekdayEvent.location) {
        /**
         * Regex replaceAll needed, otherwise on mobile hyperlinks would have half the link bare and not hyperlinked
         */
        body += `__[Maps](https://www.google.com/maps/search/KIT+${encodeURIComponent(
          weekdayEvent.location.replaceAll(/\(.*?\)/g, ''),
        )})__`
      }

      if (weekdayEvent.description.indexOf('https://kit-lecture.zoom.us') !== -1) {
        /**
         * Add zoom hyperlink if available
         */
        body += `, __[Zoom](${extractZoomLinks(weekdayEvent.description)})__`
      }

      body += '\n'
    }

    const MAX_EMBED_VALUE_LENGTH = 1024
    if (body.length > MAX_EMBED_VALUE_LENGTH) {
      body = `${body.substring(0, MAX_EMBED_VALUE_LENGTH - 3)}...`
      embed_too_long = true
    }
    embed.addFields({ name: courseDate, value: body, inline: false })
  }

  if (embed_too_long) {
    embed.addFields({
      name: `${client.translate({ key: 'interactions.wochenplan.too_long.name', lng: interaction.locale })}`,
      value: `${client.translate({ key: 'interactions.wochenplan.too_long.value', lng: interaction.locale })}`,
      inline: false,
    })
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
    if (startDate.isBetween(rangeStart, rangeEnd)) {
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

      if (relevantRecurrence === true) {
        pushToWeeksEvents(pMessageOrInteraction, event, relevantEvents)
      }
    }
  }
}

function pushToWeeksEvents(interaction, event, relevantEvents) {
  if (doubleEntry(relevantEvents, event)) {
    return
  }
  const roles = interaction.member.roles.cache.map(role => role)
  for (const role in roles) {
    let searchQuery = ''
    if (event.summary.indexOf('-') !== -1) {
      searchQuery = event.summary.split('-')[1].split('(')[0].toLowerCase()
    } else {
      searchQuery = event.summary.toString()
    }
    if (roles[role].name.toLowerCase().trim() === searchQuery.toLowerCase().trim()) {
      relevantEvents.push(event)
    }
  }
}

/**
 * Check if the new element added to @link{array} creates a duplicate
 * @param {any[]} array array to check
 * @param  {any} new_element new element on which to check if duplicate
 * @returns {boolean}
 */
function doubleEntry(array: any[], new_element: any): boolean {
  /**
   * Always return false, if array has no entry
   * There are no possible duplicates if there is nothing in the array
   */
  if (array.length < 1) {
    return false
  }

  /**
   * Check if any of the already added elements is the same as @link{new_element}
   */
  for (const entry in array) {
    if (
      array[entry].start === new_element.start &&
      array[entry].summary === new_element.summary &&
      array[entry].start.getDay() === new_element.start.getDay()
    ) {
      console.log(new_element.start.getDay())
      return true
    }
  }

  /**
   * If no duplicates have been found, return false
   */
  return false
}

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  const option = interaction.options.getString('datum')?.split('.')
  const option_date = option ? new Date(`${option[2]}-${option[1]}-${option[0]}T00:00:00`) : new Date()
  const valid_date = option_date.toString() !== 'Invalid Date'
  const date = JSON.stringify(option_date) === 'null' ? new Date() : option_date

  interaction.deferReply({ ephemeral: true })
  const embed = await wochenplan(client, interaction, date, 'all')

  if (!valid_date) {
    embed.addFields({
      name: `${client.translate({ key: 'interactions.wochenplan.invalid_Date.name', lng: interaction.locale })}`,
      value: `${client.translate({ key: 'interactions.wochenplan.invalid_Date.value', lng: interaction.locale })}`,
      inline: false,
    })
  }
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
