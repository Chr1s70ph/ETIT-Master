/* eslint-disable max-depth */
/* eslint-disable no-await-in-loop */
import { ColorResolvable, Guild, MessageEmbed, TextChannel } from 'discord.js'
import moment from 'moment'
import { async } from 'node-ical'
import { RecurrenceRule, scheduleJob } from 'node-schedule'

import { DiscordClient } from '../types/customTypes'

const { DateTime } = require('luxon')
const CRON_FETCH_EVENTS = '0 0 * * *'
const MS_PER_MINUTE = 60000
// Both Time consts are minutes
const SEND_NOTIFICATION_OFFSET = 20
const DELETE_NOTIFICATIONS_OFFSET = 90

exports.run = async (client: DiscordClient) => {
  await fetchAndSend(client)
  scheduleJob(CRON_FETCH_EVENTS, async () => {
    await fetchAndSend(client)
    updatedCalendarsNotifications(client)
  })
}

async function fetchAndSend(client: DiscordClient) {
  const today: Date = localDate()

  for (const entry in client.config.calendars) {
    const icalLink = client.config.calendars[entry]
    const events = {}
    const webEvents = await async.fromURL(icalLink)
    const eventsFromIcal = await getEvents(webEvents, today, events, entry)
    await filterToadaysEvents(client, today, eventsFromIcal)
  }
}

function localDate() {
  const tempToday = DateTime.local().toString()
  tempToday.toLocaleString('en-US', { timezone: 'Berlin/Europe' })
  const todayString = `${tempToday.slice(0, -10)}z`
  const today = new Date(todayString)
  today.setMinutes(0)
  today.setSeconds(0)
  return today
}

function updatedCalendarsNotifications(client: DiscordClient) {
  const markdownType = 'yaml'
  const calendarList = Object.keys(client.config.calendars).toString()
  const calendars = calendarList.replaceAll(',', '\n')
  // Create embed for each new fetch
  const updatedCalendars = new MessageEmbed()
    .setColor('#C7BBED')
    .setAuthor(client.user.tag, client.user.avatarURL())
    .setDescription(`**Kalender nach Events durchgesucht**\`\`\`${markdownType}\n${calendars} \`\`\``)
  // Send notification what calendars have been queried for todays events
  const channel = client.channels.cache.find(
    _channel => _channel.id === client.config.ids.channelIDs.dev.botTestLobby,
  ) as TextChannel
  channel.send({ embeds: [updatedCalendars] })
}

const datesAreOnSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate()

function getEvents(data: object, today: Date, events: object, icalName: string) {
  const weekStartDate = localDate()
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1)
  const todayStart = today
  todayStart.setUTCHours(0, 0, 0, 0)
  const todayEnd = localDate()
  todayEnd.setHours(23)
  todayEnd.setMinutes(59)
  todayEnd.setSeconds(59)

  const rangeStart = moment(todayStart).utc()
  const rangeEnd = moment(todayEnd)

  for (const k in data) {
    if (Object.prototype.hasOwnProperty.call(data, k)) {
      // When dealing with calendar recurrences, you need a range of dates to query against,
      // because otherwise you can get an infinite number of calendar events.

      const event = data[k]
      if (event.type === 'VEVENT') {
        const title = event.summary
        const description = event.description
        let startDate = moment(event.start)
        let endDate = moment(event.end)

        // Calculate the duration of the event for use with recurring events.
        const duration = Number.parseInt(endDate.format('x'), 10) - Number.parseInt(startDate.format('x'), 10)

        // Simple case - no recurrences, just print out the calendar event.
        if (typeof event.rrule === 'undefined' && datesAreOnSameDay(event.start, today)) {
          addEntryToWeeksEvents(events, today.getDay().toString(), event.start, title, description, event.location)
        } else if (typeof event.rrule !== 'undefined') {
          // Complicated case - if an RRULE exists, handle multiple recurrences of the event.
          // For recurring events, get the set of event start dates that fall within the range
          // of dates we're looking for.
          const dates = event.rrule.between(rangeStart.toDate(), rangeEnd.toDate(), true, () => true)

          // The "dates" array contains the set of dates within our desired date range range that are valid
          // for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
          // had its date changed from outside the range to inside the range.  One way to handle this is
          // to add *all* recurrence override entries into the set of dates that we check, and then later
          // filter out any recurrences that don't actually belong within our range.
          if (event.recurrences !== undefined) {
            for (const r in event.recurrences) {
              // Only add dates that weren't already in the range we added from the rrule so that
              // we don't double-add those events.
              if (moment(new Date(r)).isBetween(rangeStart, rangeEnd) !== true) {
                dates.push(new Date(r))
              }
            }
          }

          // Loop through the set of date entries to see which recurrences should be printed.
          for (const i in dates) {
            const date = dates[i]
            let curEvent = event
            let showRecurrence = true
            let curDuration = duration

            startDate = moment(date)

            // Use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
            const dateLookupKey = date.toISOString().slice(0, 10)

            // For each date that we're checking, it's possible that there is a recurrence override for that one day.
            if (curEvent.recurrences !== undefined && curEvent.recurrences[dateLookupKey] !== undefined) {
              // We found an override, so for this recurrence
              // use a potentially different title, start date, and duration.
              curEvent = curEvent.recurrences[dateLookupKey]
              startDate = moment(curEvent.start)
              curDuration =
                Number.parseInt(moment(curEvent.end).format('x'), 10) - Number.parseInt(startDate.format('x'), 10)
            } else if (curEvent.exdate !== undefined && curEvent.exdate[dateLookupKey] !== undefined) {
              // If there's no recurrence override, check for an exception date.
              // Exception dates represent exceptions to the rule.
              // This date is an exception date, which means we should skip it in the recurrence pattern.
              showRecurrence = false
            }

            // Set the the title and the end date from either the regular event or the recurrence override.
            const recurrenceTitle = curEvent.summary
            endDate = moment(Number.parseInt(startDate.format('x'), 10) + curDuration, 'x')

            // If this recurrence ends before the start of the date range, or starts after the end of the date range,
            // don't process it.
            if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
              showRecurrence = false
            }

            if (showRecurrence === true && datesAreOnSameDay(date, today)) {
              addEntryToWeeksEvents(
                events,
                today.getDay().toString(),
                curEvent.start,
                recurrenceTitle,
                curEvent.description,
                curEvent.location,
              )
            }
          }
        }
      }
    }
  }

  console.log(icalName, events)
  return events
}

function addEntryToWeeksEvents(
  events: object,
  day: string,
  start: Date,
  summary: string,
  description: string,
  location: string,
) {
  // Protection against double events
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

  events[Object.keys(events).length] = {
    day: day,
    start: start,
    summary: summary,
    description: description,
    location: location,
  }

  return events
}

function filterToadaysEvents(client: DiscordClient, today: Date, thisWeeksEvents: object) {
  for (const entry in thisWeeksEvents) {
    if (thisWeeksEvents[entry].day === today.getDay().toString()) {
      const event = thisWeeksEvents[entry]
      const summary = event.summary
      // Extract the subject after the first "-" in the string
      const subject = summary.split(/-(.+)/)[1]

      // Extract the professors Name before the "-" in the string
      const professor = summary.split(/-(.+)/)[0]

      const link = extractZoomLinks(event.description)

      const earlyEventStart = new Date(event.start - SEND_NOTIFICATION_OFFSET * MS_PER_MINUTE)

      const recurrenceRule = dateToRecurrenceRule(earlyEventStart, today)

      let role = findRole(subject, client)

      const embed = dynamicEmbed(client, role, subject, professor, SEND_NOTIFICATION_OFFSET, link, event.location)

      let channel = findChannel(subject, client)

      if (channel === undefined) {
        channel = client.config.ids.channelIDs.dev.botTestLobby
      }

      if (noVariableUndefined(recurrenceRule, channel, role, embed, client)) {
        role = `<@&${role}>`
      } else if (role === undefined) {
        role = ''
      }

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

  // Extract link from href tag
  eventLinkString = eventLinkString.includes('<a href=')
    ? eventLinkString.split('<a href=')[1].split('>')[0]
    : eventLinkString

  // Strip all html tags and encode as URI
  const link = eventLinkString.replace(/(<.*?>)/g, '')

  // Remove "#success" string, to automatically open zoom
  return link.includes('#success') ? link.split('#success')[0] : link.includes('id=') ? link.split('id=')[0] : link
}

/**
 * Create CronTimestamp for event
 * @param {Date} eventDate datestring of Event
 * @param {Object} todaysDate Dateobject
 * @returns {any} RecurrenceRule
 */
function dateToRecurrenceRule(eventDate: Date, todaysDate: Date) {
  const rule = new RecurrenceRule()
  rule.second = typeof eventDate === 'undefined' ? 0 : eventDate.getSeconds()
  rule.minute = typeof eventDate === 'undefined' ? 0 : eventDate.getMinutes()
  rule.hour = typeof eventDate === 'undefined' ? 0 : eventDate.getHours()
  rule.date = todaysDate.getDate()
  rule.month = todaysDate.getMonth()
  rule.year = todaysDate.getFullYear()
  rule.tz = 'Europe/Berlin'
  return rule
}

/**
 *
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
  const roleColor: ColorResolvable =
    client.guilds.resolve(client.config.ids.serverID).roles.cache.get(role)?.color ?? 'DEFAULT'
  let courseType = 'Vorlesung'

  if (subject.includes('(ü)') || subject.includes('(Ü)')) courseType = 'Übung'

  const embedDynamic = new MessageEmbed()
  try {
    embedDynamic
      .setColor(roleColor)
      .setAuthor(
        `${courseType}s Reminder`,
        client.guilds
          .resolve(client.config.ids.serverID)
          .members.resolve(client.config.ids.userID.botUserID)
          .user.avatarURL(),
      )
      .setTitle(`${subject} Reminder`)
      .setDescription(`Die ${courseType} fängt in ${lessonsOffset} Minuten an`)
      .setThumbnail('https://pics.freeicons.io/uploads/icons/png/6029094171580282643-512.png')
      .addField('Dozent', professor, false)
      .setFooter(
        'Viel Spaß und Erfolg wünscht euch euer ETIT-Master',
        client.guilds
          .resolve(client.config.ids.serverID)
          .members.resolve(client.config.ids.userID.botUserID)
          .user.avatarURL(),
      )
  } catch (e) {
    const embed = 'There was an error creating the embed'
    const channel = client.channels.cache.find(_channel => _channel.id === '852530207336169523') as TextChannel
    // Sends login embed to channel
    channel.send(`${embed}\n${e}`)
  }

  if (link) {
    embedDynamic.setURL(link)
  }

  if (location) {
    embedDynamic.addField(
      'Location:',
      `${location} [Maps](https://www.google.com/maps/search/KIT+${encodeURIComponent(location)})`,
      false,
    )
  }

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
 * @returns {string}     returns the channelID based on subject
 *
 * @throws Error in debug channel
 */
function findChannel(subject: string, client: DiscordClient): string {
  const REGEX_TO_REMOVE_EMOJIS = /\p{Emoji}/gu

  // Remove leading and trailing space
  subject = subject.trim()
  // Remove all content in, and brackets
  subject = subject.replace(/ *\([^)]*\) */g, '')
  // Replace all spaces with "-"
  subject = subject.replace(/\s+/g, '-')
  subject = subject.toLowerCase()
  const guild = client.guilds.cache.get(client.config.ids.serverID) as Guild
  const channel = guild.channels.cache.find(
    _channel => _channel.name.replace(REGEX_TO_REMOVE_EMOJIS, '').toLowerCase() === subject.toLowerCase(),
  ) as TextChannel

  const channelID = channel?.id ? channel.id : client.config.ids.channelIDs.dev.botTestLobby

  return channelID
}

function findRole(subject, client) {
  // Remove leading and trailing space
  subject = subject.trim()
  // Remove all content in, and brackets
  subject = subject.replace(/ *\([^)]*\) */g, '')
  const guild = client.guilds.cache.get(client.config.ids.serverID)
  const role = guild.roles.cache.find(_role => subject.toLowerCase() === _role.name.toLowerCase())?.id ?? null
  return role
}

function noVariableUndefined(...args) {
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
) {
  const channel = client.channels.cache.find(Channel => Channel.id === _channel) as TextChannel
  const channelName = channel.name

  scheduleJob(recurrenceRule, () => {
    console.log(`Sent notification to ${channelName}`)
    const notificationChannel = client.channels.cache.find(Channel => Channel === channel) as TextChannel
    notificationChannel?.send({ content: role || null, embeds: [embed.setTimestamp()] }).then(msg => {
      setTimeout(() => {
        try {
          msg.delete()
          console.log(`Deleted notification in ${channelName}`)
        } catch (error) {
          console.log(`There was a problem deleting the notification in ${channelName}\n${error}`)
        }
      }, DELETE_NOTIFICATIONS_OFFSET * MS_PER_MINUTE)
    })
  })
}
