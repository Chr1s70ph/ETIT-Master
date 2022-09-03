import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'
import moment from 'moment-timezone'
import { async } from 'node-ical'
import {
  DiscordClient,
  DiscordCommandInteraction,
  DiscordSlashCommandBuilder,
  DiscordButtonInteraction,
} from '../types/customTypes'

exports.name = 'wochenplan'

exports.description = '️Zeigt den Wochenplan an.'

exports.usage = `wochenplan {TAG}`

let startOfWeek = new Date()

export const data = new DiscordSlashCommandBuilder()
  .setName('wochenplan')
  .setDescription('Zeigt deinen Wochenplan an.')
  .addStringOption(option =>
    option.setName('datum').setDescription('Das Datum, das angezeigt werden soll. Format: DD.MM.YYYY'),
  )
  .setLocalizations('wochenplan')

async function wochenplan(
  client: DiscordClient,
  interaction: DiscordCommandInteraction | DiscordButtonInteraction,
  date,
) {
  let returnData = {}
  for (const entry in client.config.calendars) {
    // eslint-disable-next-line no-await-in-loop
    returnData = { ...returnData, ...(await async.fromURL(client.config.calendars[entry])) }
  }

  const relevantEvents = []
  const curWeekday = date.getDay() === 0 ? 6 : date.getDay() - 1
  startOfWeek = new Date(date.setDate(date.getDate() - curWeekday))
  startOfWeek.setHours(0, 0, 0)

  const rangeStart = moment(startOfWeek)
  const rangeEnd = rangeStart.clone().add(7, 'days')

  filterEvents(returnData, rangeStart, rangeEnd, interaction, relevantEvents)

  const embed = new EmbedBuilder()
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
        key: 'interactions.wochenplan.week',
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
  pMessageOrInteraction: any,
  relevantEvents: any[],
) {
  for (const i in returnData) {
    const event = returnData[i]
    if (returnData[i].type === 'VEVENT') {
      const startDate = moment(event.start)
      const endDate = moment(event.end)
      const duration = Number.parseInt(endDate.format('x'), 10) - Number.parseInt(startDate.format('x'), 10)
      secondFIlter(event, startDate, rangeStart, rangeEnd, pMessageOrInteraction, relevantEvents, duration, endDate)
    }
  }
}

function secondFIlter(
  event: any,
  startDate: any,
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
  pMessageOrInteraction: any,
  relevantEvents: any[],
  duration: number,
  endDate: any,
) {
  if (typeof event.rrule === 'undefined') {
    if (startDate.isBetween(rangeStart, rangeEnd)) {
      pushToWeeksEvents(pMessageOrInteraction, event, relevantEvents, event.start, event.end)
    }
  } else {
    /**
     * Complicated case - if an RRULE exists, handle multiple recurrences of the event.
     *  For recurring events, get the set of event start dates that fall within the range
     *  of dates we're looking for.
     */
    const dates = event.rrule.between(rangeStart.toDate(), rangeEnd.toDate(), true, () => true)

    /**
     * The "dates" array contains the set of dates within our desired date range range that are valid
     * for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
     * had its date changed from outside the range to inside the range.  One way to handle this is
     * to add *all* recurrence override entries into the set of dates that we check, and then later
     * filter out any recurrences that don't actually belong within our range.
     */
    if (event.recurrences !== undefined) {
      for (const recurrence in event.recurrences) {
        /**
         * Only add dates that weren't already in the range we added from the rrule so that
         * we don't double-add those events.
         */
        if (moment(new Date(recurrence)).isBetween(rangeStart, rangeEnd) !== true) {
          dates.push(new Date(recurrence))
        }
      }
    }

    for (const i in dates) {
      /**
       * Reccurence date.
       */
      const date = dates[i]
      let curEvent = event
      let relevantRecurrence = true

      startDate = moment(date)
      endDate = startDate.clone().add(moment.duration(moment(curEvent.end).diff(curEvent.start)).asHours(), 'hours')

      const dateLookupKey = date.toISOString().substring(0, 10)
      if (curEvent.recurrences !== undefined && curEvent.recurrences[dateLookupKey] !== undefined) {
        curEvent = curEvent.recurrences[dateLookupKey]
        startDate = moment(curEvent.start)
        endDate = startDate.clone().add(moment.duration(moment(curEvent.end).diff(curEvent.start)).asHours(), 'hours')
      } else if (curEvent.exdate !== undefined && curEvent.exdate[dateLookupKey] !== undefined) {
        relevantRecurrence = false
      }

      if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
        relevantRecurrence = false
      }

      if (relevantRecurrence === true) {
        pushToWeeksEvents(pMessageOrInteraction, curEvent, startDate, endDate, relevantEvents)
      }
    }
  }
}

function pushToWeeksEvents(interaction, event, event_start, event_end, relevantEvents) {
  if (doubleEntry(relevantEvents, event, event_start, event_end)) {
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
      /**
       * Add entry with new key.
       * Key increments by one (determined by length).
       */
      relevantEvents[Object.keys(relevantEvents).length] = {
        start: event_start,
        end: event_end,
        summary: event.summary,
        description: event.description,
        location: event.location,
      }
    }
  }
}

/**
 * Check if the new element added to @link{array} creates a duplicate
 * @param {any[]} array array to check
 * @param  {any} new_element new element on which to check if duplicate
 * @param {Date} start_date end date of event
 * @param {Date} end_date start date of event
 * @returns {boolean}
 */
function doubleEntry(array: any[], new_element: any, start_date: Date, end_date: Date): boolean {
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
      array[entry].start.getDay() === start_date &&
      array[entry].end.getDay() === end_date
    ) {
      return true
    }
  }

  /**
   * If no duplicates have been found, return false
   */
  return false
}

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  /**
   * Defer interaction reply, since it can take some time to come through all calendars
   */
  await interaction.deferReply({ ephemeral: true })

  /**
   * Get options from interaction
   */
  const options: string = interaction.options.get('datum')?.value as string
  const option: string[] = options?.split('.')

  /**
   * Cast options to date
   */
  const option_date = option ? new Date(`${option[2]}-${option[1]}-${option[0]}T00:00:00`) : new Date()
  const valid_date = option_date.toString() !== 'Invalid Date'
  const date = JSON.stringify(option_date) === 'null' ? new Date() : option_date

  /**
   * Create embed for current week
   */
  const embed = await wochenplan(client, interaction, date)

  /**
   * Create buttons for current week
   */
  const buttonRow = createWeekButtons(startOfWeek, client, interaction)

  /**
   * Tell user, that the entered date is invalid
   */
  if (!valid_date) {
    embed.addFields({
      name: `${client.translate({ key: 'interactions.wochenplan.invalid_Date.name', lng: interaction.locale })}`,
      value: `${client.translate({ key: 'interactions.wochenplan.invalid_Date.value', lng: interaction.locale })}`,
      inline: false,
    })
  }

  /**
   * Send current weeks schedule
   */
  await interaction.editReply({
    embeds: [embed],
    components: [buttonRow],
  })
}

exports.Button = async (client: DiscordClient, interaction: DiscordButtonInteraction): Promise<void> => {
  /**
   * Get current week from customID of the button triggered
   */
  const curWeek = interaction.customId.split('.')[2]

  /**
   * Create new embed
   */
  const embed = await wochenplan(client, interaction, new Date(curWeek))

  /**
   * Create new buttons
   */
  const buttons = createWeekButtons(new Date(curWeek), client, interaction)

  /**
   * Update the interaction with the new embed and buttons
   */
  interaction.update({ embeds: [embed], components: [buttons] })
}

/**
 * Helper function to create a ActionRow containing buttons for previous/next week
 * @param {Date} weekStartDay week start of which to get prev/next week buttons for
 * @param {DiscordClient} client Bot-Client
 * @param {DiscordCommandInteraction | DiscordButtonInteraction} interaction interaction to reply to
 * @returns {ActionRowBuilder<ButtonBuilder>} Actionrow
 */
function createWeekButtons(
  weekStartDay: Date,
  client: DiscordClient,
  interaction: DiscordCommandInteraction | DiscordButtonInteraction,
): ActionRowBuilder<ButtonBuilder> {
  /**
   * Calculate previous and next week
   */
  const prevWeek = moment(new Date(weekStartDay.getTime() - 7 * 24 * 60 * 60 * 1000))
  const nextWeek = moment(new Date(weekStartDay.getTime() + 7 * 24 * 60 * 60 * 1000))

  /**
   * Action row to return
   */
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    /**
     * Button for previous week
     */
    new ButtonBuilder()
      .setCustomId(`wochenplan.prev_week.${prevWeek.format('YYYY-MM-DD')}`)
      .setLabel(
        `${client.translate({
          key: 'interactions.wochenplan.prev_week',
          options: {
            interpolation: { escapeValue: false },
            week_start_date: prevWeek.format('DD.MM'),
            lng: interaction.locale,
          },
        })}`,
      )
      .setStyle(ButtonStyle.Primary),

    /**
     * Blank button for seperation
     */
    new ButtonBuilder()
      .setCustomId('wochenplan.blank')
      .setLabel('   ')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),

    /**
     * Button for next week
     */
    new ButtonBuilder()
      .setCustomId(`wochenplan.mext_week.${nextWeek.format('YYYY-MM-DD')}`)
      .setLabel(
        `${client.translate({
          key: 'interactions.wochenplan.next_week',
          options: {
            interpolation: { escapeValue: false },
            week_start_date: nextWeek.format('DD.MM'),
            lng: interaction.locale,
          },
        })}`,
      )
      .setStyle(ButtonStyle.Primary),
  )
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
