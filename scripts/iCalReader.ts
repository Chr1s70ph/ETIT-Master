/* eslint-disable no-await-in-loop */
import { ColorResolvable, Guild, MessageEmbed, Snowflake, TextChannel } from 'discord.js'
import moment from 'moment'
import { async } from 'node-ical'
import { RecurrenceRule, scheduleJob } from 'node-schedule'

import { DiscordClient } from '../types/customTypes'

const { DateTime } = require('luxon')
const CRON_FETCH_EVENTS = '0 0 * * *'
const MS_PER_MINUTE = 60000
/**
 * Both Time consts are minutes.
 */
const SEND_NOTIFICATION_OFFSET = 20
const DELETE_NOTIFICATIONS_OFFSET = 115

exports.run = async (client: DiscordClient) => {
  await fetchAndSend(client)
  scheduleJob(CRON_FETCH_EVENTS, async () => {
    await fetchAndSend(client)
    updatedCalendarsNotifications(client)
  })
}

/**
 * Fetche and schedule the events of the current day.
 * @param {DiscordClient} client Bot-Client
 * @returns {Promise<void>}
 */
async function fetchAndSend(client: DiscordClient): Promise<void> {
  /**
   * Date of current day.
   */
  const today: Date = localDate('Berlin/Europe')

  /**
   * Loop through all calendars.
   */
  for (const entry in client.config.calendars) {
    /**
     * Link to ics file.
     */
    const icalLink = client.config.calendars[entry]

    /**
     * Object with todays events.
     */
    const events = {}

    /**
     * All events fetched from {@link icalLink}.
     */
    const webEvents = await async.fromURL(icalLink)

    /**
     * All events from the current day.
     */
    const eventsFromIcal = await getEvents(webEvents, today, events, entry)

    /**
     * Schedule the notifications.
     */
    await scheduleNotifications(client, today, eventsFromIcal)
  }
}

/**
 * Helperfunction to get current Date.
 * @param {string} Timezone to get the Date from
 * @returns {Date} Current Date specified with {@link Timezone}
 */
function localDate(Timezone: string): Date {
  /**
   * Temporary date of local timezone.
   */
  const tempToday = DateTime.local().toString()

  /**
   * Convert {@link tempToday} to {@link Timezone}.
   */
  tempToday.toLocaleString('en-US', { timezone: Timezone })

  /**
   * Slice {@link tempToday} and add 'z' at the end.
   */
  const todayString = `${tempToday.slice(0, -10)}z`

  /**
   * Create new date with {@link todayString}.
   */
  const today = new Date(todayString)

  /**
   * Set minutes and seconds to 0, so {@link today} starts at an even hour.
   */
  today.setMinutes(0)
  today.setSeconds(0)

  /**
   * Return date.
   */
  return today
}

/**
 * Sends a notification to the admin channel to signiy that the calendars have been updated.
 * @param {DsciordClient} client Bot-Client
 */
function updatedCalendarsNotifications(client: DiscordClient): void {
  /**
   * Markdown type to format embed with.
   */
  const markdownType = 'yaml'

  /**
   * List of all calendars.
   */
  const calendarList = Object.keys(client.config.calendars).toString()

  /**
   * Format list to use newline characters.
   */
  const calendars = calendarList.replaceAll(',', '\n')

  /**
   * Create embed for each new fetch.
   */
  const updatedCalendars = new MessageEmbed()
    .setColor('#C7BBED')
    .setAuthor({ name: client.user.tag, iconURL: client.user.avatarURL() })
    .setDescription(`**Kalender nach Events durchgesucht**\`\`\`${markdownType}\n${calendars} \`\`\``)

  /**
   * Send notification what calendars have been queried for todays events.
   */
  const channel = client.channels.cache.find(
    _channel => _channel.id === client.config.ids.channelIDs.dev.botTestLobby,
  ) as TextChannel
  channel.send({ embeds: [updatedCalendars] })
}

/**
 * Returns true, if dates are on the same day.
 * @param {Date} first First date to compare
 * @param {Date} second Second date to compare
 * @returns {boolean}
 */
const datesAreOnSameDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate()

/**
 * Get events from the current day.
 * @param {Object} data Ical data
 * @param {Date} today Date object of todays date
 * @param {Object} events Object with todays events
 * @param {string} icalName Name of the calendar
 * @returns {Object}
 */
function getEvents(data: object, today: Date, events: object, icalName: string): object {
  /**
   * Start of todays day. (i.e 00:00:00).
   */
  const todayStart = today

  /**
   * Set hours, minutes, seconds and miliseconds to 0.
   */
  todayStart.setUTCHours(0, 0, 0, 0)

  /**
   * End of todays day. (i.e 23:59:59).
   */
  const todayEnd = localDate('Berlin/Europe')

  /**
   * Set hours to last hour of the day.
   */
  todayEnd.setHours(23)

  /**
   * Set minutes to the last minute.
   */
  todayEnd.setMinutes(59)

  /**
   * Set seconds to the last second.
   */
  todayEnd.setSeconds(59)

  /**
   * When dealing with calendar recurrences, you need a range of dates to query against,
   * because otherwise you can get an infinite number of calendar events.
   */

  /**
   * Start of timeframe to filter events.
   */
  const rangeStart = moment(todayStart).utc()

  /**
   * End of timeframe to filter events.
   */
  const rangeEnd = moment(todayEnd)

  /**
   * Loop through all entries in the calendar.
   */
  for (const k in data) {
    if (Object.prototype.hasOwnProperty.call(data, k)) {
      /**
       * Filter events, and add them to {@link events} if they occur on the current day.
       */
      if (data[k].type === 'VEVENT') eventFilter(data[k], today, events, rangeStart, rangeEnd)
    }
  }

  /**
   * Log events for overfiew of todays events.
   */
  console.log(icalName, events)

  return events
}

/**
 * Add {@link event} to {@link events} if it occurs today.
 * @param {any} event Event to filter
 * @param {Date} today Date object of todays date
 * @param {Object} events Object with todays events
 * @param {moment.Moment} rangeStart Start of current day
 * @param {moment.Moment} rangeEnd End of current day
 * @returns {void}
 */
function eventFilter(
  event: any,
  today: Date,
  events: object,
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
): void {
  /**
   * Title of {@link event}.
   */
  const title = event.summary

  /**
   * Description of {@link event}.
   */
  const description = event.description

  /**
   * Start of {@link event}.
   */
  const startDate = moment(event.start)

  /**
   * End of {@link event}.
   */
  const endDate = moment(event.end)

  /**
   * Calculate the duration of the event for use with recurring events.
   */
  const duration = Number.parseInt(endDate.format('x'), 10) - Number.parseInt(startDate.format('x'), 10)

  /**
   * Simple case - no recurrences, just print out the calendar event.
   */
  if (typeof event.rrule === 'undefined' && datesAreOnSameDay(event.start, today)) {
    /**
     * Add event to todays {@link events}.
     */
    addEntryToTodaysEvents(events, today.getDay().toString(), event.start, title, description, event.location)
  } else if (typeof event.rrule !== 'undefined') {
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
      for (const r in event.recurrences) {
        /**
         * Only add dates that weren't already in the range we added from the rrule so that
         * we don't double-add those events.
         */
        if (moment(new Date(r)).isBetween(rangeStart, rangeEnd) !== true) {
          dates.push(new Date(r))
        }
      }
    }

    /**
     * Loop through the set of date entries to see which recurrences should be printed.
     */
    rruleFilter(dates, event, duration, startDate, endDate, rangeStart, rangeEnd, today, events)
  }
}

/**
 * Loop through the set of date entries to see which recurrences should be printed.
 * @param {any} dates Dates of event
 * @param {any} event Event to filter
 * @param {number} duration Dudation of event
 * @param {moment.Moment} startDate Start of event
 * @param {moment.Moment} endDate End of event
 * @param {moment.Moment} rangeStart Start of current day
 * @param {moment.Moment} rangeEnd End of current day
 * @param {Date} today Date object of todays date
 * @param {Object} events Object with todays events
 * @returns {moment}
 */
function rruleFilter(
  dates: any,
  event: any,
  duration: number,
  startDate: moment.Moment,
  endDate: moment.Moment,
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
  today: Date,
  events: object,
): { startDate: moment.Moment; endDate: moment.Moment } {
  for (const i in dates) {
    /**
     * Reccurence date.
     */
    const date = dates[i]

    /**
     * Current event in for-loop.
     */
    let curEvent = event

    /**
     * Boolean if event is today.
     */
    let showRecurrence = true

    /**
     * Duration of {@link curEvent}.
     */
    let curDuration = duration

    /**
     * Start of {@link curEvent} {@link curDuration}.
     */
    startDate = moment(date)

    /**
     * Use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
     */
    const dateLookupKey = date.toISOString().slice(0, 10)

    /**
     * For each date that we're checking, it's possible that there is a recurrence override for that one day.
     */
    if (curEvent.recurrences !== undefined && curEvent.recurrences[dateLookupKey] !== undefined) {
      /**
       * We found an override, so for this recurrence
       * use a potentially different title, start date, and duration.
       */
      curEvent = curEvent.recurrences[dateLookupKey]
      startDate = moment(curEvent.start)
      curDuration = Number.parseInt(moment(curEvent.end).format('x'), 10) - Number.parseInt(startDate.format('x'), 10)
    } else if (curEvent.exdate !== undefined && curEvent.exdate[dateLookupKey] !== undefined) {
      /**
       * If there's no recurrence override, check for an exception date.
       * Exception dates represent exceptions to the rule.
       * This date is an exception date, which means we should skip it in the recurrence pattern.
       */
      showRecurrence = false
    }

    /**
     * Set the the title and the end date from either the regular event or the recurrence override.
     */
    const recurrenceTitle = curEvent.summary
    endDate = moment(Number.parseInt(startDate.format('x'), 10) + curDuration, 'x')

    /**
     * If this recurrence ends before the start of the date range, or starts after the end of the date range,
     * don't process it.
     */
    if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
      showRecurrence = false
    }

    if (showRecurrence === true && datesAreOnSameDay(date, today)) {
      /**
       * Add event to todays {@link events}.
       */
      addEntryToTodaysEvents(
        events,
        today.getDay().toString(),
        curEvent.start,
        recurrenceTitle,
        curEvent.description,
        curEvent.location,
      )
    }
  }

  return { startDate, endDate }
}

/**
 * Add entries to {@link events}.
 * @param {Object} events Object with todays events
 * @param {string} day Current weekday
 * @param {Date} start Start of event
 * @param {string} summary Summary of event
 * @param {string} description Description of event
 * @param {string} location Location of event
 * @returns {Object}
 */
function addEntryToTodaysEvents(
  events: object,
  day: string,
  start: Date,
  summary: string,
  description: string,
  location: string,
): object {
  /**
   * Protection against double events.
   * Only add event if it is one of a kind.
   */
  for (const elemtent in events) {
    if (
      events[elemtent].start === start &&
      events[elemtent].summary === summary &&
      events[elemtent].description === description &&
      events[elemtent].location === location
    ) {
      return events
    }
  }

  /**
   * Add entry with new key.
   * Key increments by one (determined by length).
   */
  events[Object.keys(events).length] = {
    day: day,
    start: start,
    summary: summary,
    description: description,
    location: location,
  }

  return events
}

/**
 * Create notifications for {@link events} and schedule them.
 * @param {DiscordClient} client Bot-Client
 * @param {Date} today Date object of todays date
 * @param {Object} events object with todays events
 * @returns {void}
 */
function scheduleNotifications(client: DiscordClient, today: Date, events: object): void {
  for (const entry in events) {
    if (events[entry].day === today.getDay().toString()) {
      /**
       * Current event in loop.
       */
      const event = events[entry]

      /**
       * Summary of current event.
       */
      const summary = event.summary

      /**
       * Extract the subject after the first "-" in the string.
       */
      const subject = summary.split(/-(.+)/)[1]

      /**
       * Extract the professors Name before the "-" in the string.
       */
      const professor = summary.split(/-(.+)/)[0]

      /**
       * Link of current event.
       */
      const link = extractZoomLinks(event.description)

      /**
       * Timestamp to send notificaction.
       */
      const earlyEventStart = new Date(event.start - SEND_NOTIFICATION_OFFSET * MS_PER_MINUTE)

      /**
       * Recurrencerule to send notification.
       */
      const recurrenceRule = dateToRecurrenceRule(earlyEventStart, today)

      /**
       * Role to ping.
       */
      let role = findRole(subject, client)

      /**
       * Notification Embed to send.
       */
      const embed = dynamicEmbed(client, role, subject, professor, SEND_NOTIFICATION_OFFSET, link, event.location)

      /**
       * Channel to send notification to.
       */
      let channel = findChannel(subject, client)

      /**
       * Send notification to botTestLobby in case channel is not found.
       */
      if (channel === undefined) {
        channel = client.config.ids.channelIDs.dev.botTestLobby
      }

      /**
       * Check if all necessary variables are defined.
       */
      if (noVariableUndefined(recurrenceRule, channel, role, embed, client)) {
        role = `<@&${role}>`
      } else if (role === undefined) {
        role = ''
      }

      /**
       * Schedule notifications.
       */
      createCron(recurrenceRule, channel, role, embed, client)
    }
  }
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

/**
 * Create CronTimestamp for event
 * @param {Date} eventDate datestring of Event
 * @param {Object} todaysDate Dateobject
 * @returns {any} RecurrenceRule
 */
function dateToRecurrenceRule(eventDate: Date, todaysDate: Date): RecurrenceRule {
  /**
   * Create new RecurrenceRule.
   */
  const rule = new RecurrenceRule()

  /**
   * If eventdate is not defined, set seconds, minutes and hour to 0, so notification will be sent at midnight.
   */
  rule.second = typeof eventDate === 'undefined' ? 0 : eventDate.getSeconds()
  rule.minute = typeof eventDate === 'undefined' ? 0 : eventDate.getMinutes()
  rule.hour = typeof eventDate === 'undefined' ? 0 : eventDate.getHours()

  /**
   * Set date to current day to ensure notifications are not scheduled for the wrong day.
   */
  rule.date = todaysDate.getDate()
  rule.month = todaysDate.getMonth()
  rule.year = todaysDate.getFullYear()

  /**
   * Set timezone to Europe/Berlin (locale timezone of Bot-instance).
   */
  rule.tz = 'Europe/Berlin'

  /**
   * Return RecurrenceRule.
   */
  return rule
}

/**
 * Create dynamic embed.
 * @param {DiscordClient} client DiscordClient
 * @param {string} role role to ping
 * @param {string} subject lesson subject
 * @param {string} professor lesson professor
 * @param {number} lessonsOffset minutes ping should be sent ahead
 * @param {string} link zoom/Videoconference link
 * @param {string} location googleMaps link
 * @returns {Object}MessageEmbed
 */
function dynamicEmbed(
  client: DiscordClient,
  role: string,
  subject: string,
  professor: string,
  lessonsOffset: number,
  link: string,
  location: string,
): MessageEmbed {
  /**
   * Color of {@link role}.
   */
  const roleColor: ColorResolvable =
    client.guilds.resolve(client.config.ids.serverID).roles.cache.get(role)?.color ?? 'DEFAULT'

  /**
   * Type of course.
   */
  let courseType = 'Vorlesung'

  /**
   * Change {@link courseType} if it is an exercise.
   */
  if (subject.toLowerCase().includes('(ü)')) courseType = 'Übung'

  /**
   * Dynamic embed with information about {@link event}.
   */
  const embedDynamic = new MessageEmbed()
  try {
    embedDynamic
      .setColor(roleColor)
      .setAuthor({ name: `${courseType}s Reminder`, iconURL: client.user.avatarURL() })
      .setTitle(`${subject} Reminder`)
      .setDescription(`Die ${courseType} fängt in ${lessonsOffset} Minuten an`)
      .setThumbnail('https://pics.freeicons.io/uploads/icons/png/6029094171580282643-512.png')
      .addField('Dozent', professor, false)
      .setFooter({
        text: 'Viel Spaß und Erfolg wünscht euch euer ETIT-Master',
        iconURL: client.guilds
          .resolve(client.config.ids.serverID)
          .members.resolve(client.config.ids.userID.botUserID)
          .user.avatarURL(),
      })
  } catch (e) {
    /**
     * Error Message.
     */
    const errorMessage = `There was an error creating the embed\n${e.toString()}`

    /**
     * Fetch channel to send {@link errorMessage} to.
     */
    const channel = client.channels.cache.find(
      _channel => _channel.id === client.config.ids.channelIDs.dev.botTestLobby,
    ) as TextChannel

    /**
     * Send {@link errorMessage} embed to {@link channel}.
     */
    channel.send(errorMessage)
  }

  /**
   * Add url to embed if existant.
   */
  if (link) {
    embedDynamic.setURL(link)
  }

  /**
   * Add link to google maps if existant.
   */
  if (location) {
    embedDynamic.addField(
      'Location:',
      `${location} [Maps](https://www.google.com/maps/search/KIT+${encodeURIComponent(location)})`,
      false,
    )
  }

  /**
   * Return {@link MessageEmbed}.
   */
  return embedDynamic
}

/**
 * Returns channelID
 *
 * analyzes the contents of the "subject" and sets "channel" based on its contents
 * sends in case of an error, said error to the debug channel
 *
 * @param {string} subject subject exported from iCal
 * @param {Object} client necessary to return error messages to debug channel
 * @returns {Snowflake}
 *
 * @throws Error in debug channel
 */
function findChannel(subject: string, client: DiscordClient): Snowflake {
  /**
   * Remove leading and trailing space.
   */
  subject = subject.trim()

  /**
   * Remove all content in, and brackets.
   */
  subject = subject.replace(/ *\([^)]*\) */g, '')

  /**
   * Replace all spaces with "-".
   */
  subject = subject.replace(/\s+/g, '-')

  /**
   * Make sure subject is lowercase.
   */
  subject = subject.toLowerCase()

  /**
   * Guild to fetch channelID from.
   */
  const guild = client.guilds.cache.get(client.config.ids.serverID) as Guild

  /**
   * Channel to get ID from.
   */
  const channel = guild.channels.cache.find(
    _channel => _channel.name.replace(/\p{Emoji}/gu, '').toLowerCase() === subject.toLowerCase(),
  ) as TextChannel

  /**
   * Channel id.
   * If {@link channel} is undefined, default back to botTestLobby.
   */
  const channelID = channel?.id ? channel.id : client.config.ids.channelIDs.dev.botTestLobby

  /**
   * Return {@link channelID}.
   */
  return channelID
}

/**
 * Find a roleid based on its name.
 * @param {string} subject Subject to find role for
 * @param {DiscordClient} client Bot-Client
 * @returns {Snowflake}
 */
function findRole(subject: string, client: DiscordClient): Snowflake {
  /**
   * Remove leading and trailing space.
   */
  subject = subject.trim()

  /**
   * Remove all content in, and brackets.
   */
  subject = subject.replace(/ *\([^)]*\) */g, '')

  /**
   * Guild to find role from.
   */
  const guild = client.guilds.cache.get(client.config.ids.serverID)

  /**
   * Role from {@link guild}.
   */
  const role = guild.roles.cache.find(_role => subject.toLowerCase() === _role.name.toLowerCase())?.id ?? null

  /**
   * Return {@link role}.
   */
  return role
}

/**
 * Check if any provided arguments are undefined.
 * @param {any} args Arguments to check for undefined
 * @returns {boolean}
 */
function noVariableUndefined(...args: any): boolean {
  for (const arg in args) {
    if (args[arg] === undefined) {
      return false
    }
  }

  return true
}

/**
 *
 * @param {string} recurrenceRule string in RecurrenceRule format
 * @param {string} _channel destination channel for message
 * @param {string} role role what is supposed to be pinged
 * @param {Object} embed embed what is sent
 * @param {Object} client required by discord.js
 */
function createCron(
  recurrenceRule: RecurrenceRule,
  _channel: string,
  role: string,
  embed: MessageEmbed,
  client: DiscordClient,
): void {
  /**
   * Channel to send notification to.
   */
  const channel = client.channels.cache.find(Channel => Channel.id === _channel) as TextChannel

  /**
   * Name of {@link channel}.
   */
  const channelName = channel.name

  /**
   * Schedule notification.
   */
  scheduleJob(recurrenceRule, () => {
    /**
     * Log that notification has been sent.
     */
    console.log(`Sent notification to ${channelName}`)

    /**
     * Send message to channel.
     */
    channel?.send({ content: role || null, embeds: [embed.setTimestamp()] }).then(msg => {
      setTimeout(() => {
        try {
          /**
           * Delete message after timeperiod specified in {@link DELETE_NOTIFICATIONS_OFFSET}.
           */
          msg.delete()
          console.log(`Deleted notification in ${channelName}`)
        } catch (error) {
          /**
           * Error handling.
           */
          console.log(`There was a problem deleting the notification in ${channelName}\n${error}`)
        }
      }, DELETE_NOTIFICATIONS_OFFSET * MS_PER_MINUTE)
    })
  })
}
