/* eslint-disable no-await-in-loop */
import { ColorResolvable, Guild, EmbedBuilder, Snowflake, TextChannel } from 'discord.js'
import moment from 'moment'
import { RecurrenceRule, scheduleJob } from 'node-schedule'
import tx2 from 'tx2'
import { extractZoomLinks, fetchAndCacheCalendars, filterEvents } from '../types/calendar_helper_functions'
import { DiscordClient } from '../types/customTypes'

const { DateTime } = require('luxon')
const CRON_FETCH_EVENTS = '0 0 * * *'
const MS_PER_MINUTE = 60000
/**
 * Both Time consts are minutes.
 */
const SEND_NOTIFICATION_OFFSET = 20
const DELETE_NOTIFICATIONS_OFFSET = 115

/**
 * Custom PM2 metric.
 */
const scheduledNotifications = tx2.metric({
  name: 'Number of scheduled notifications today',
})

/**
 * Variable for counting scheduled notifications
 */
let created_notifications = 0

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
   * Reset variable for counting scheduled notifications
   */
  created_notifications = 0

  /**
   * Date of current day.
   */
  const today: Date = localDate('Berlin/Europe')

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
  todayEnd.setUTCHours(23, 59, 59, 0)

  await fetchAndCacheCalendars(client)

  /**
   * All calendars.
   */
  let calendars_object = {}
  const calendars = client.calendars.values()
  for (const entry of calendars) {
    calendars_object = { ...calendars_object, ...entry }
  }

  /**
   * All events from the current day.
   */
  const relevantEvents = []

  filterEvents(calendars_object, moment(todayStart), moment(todayEnd), undefined, relevantEvents, false)

  console.log(relevantEvents)

  /**
   * Schedule the notifications.
   */
  await scheduleNotifications(client, today, relevantEvents)
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
  const updatedCalendars = new EmbedBuilder()
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
 * Create notifications for {@link events} and schedule them.
 * @param {DiscordClient} client Bot-Client
 * @param {Date} today Date object of todays date
 * @param {Object} events object with todays events
 * @returns {void}
 */
function scheduleNotifications(client: DiscordClient, today: Date, events: object): void {
  for (const entry in events) {
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
    const role = findRole(subject, client)

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
     * Schedule notifications.
     */
    createCron(recurrenceRule, channel, role, embed, client)
    created_notifications += 1
  }
  scheduledNotifications.set(created_notifications)
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
 * @returns {Object}EmbedBuilder
 */
function dynamicEmbed(
  client: DiscordClient,
  role: string,
  subject: string,
  professor: string,
  lessonsOffset: number,
  link: string,
  location: string,
): EmbedBuilder {
  /**
   * Color of {@link role}.
   */
  const roleColor: ColorResolvable =
    client.guilds.resolve(client.config.ids.serverID).roles.cache.get(role)?.color ?? 'Default'

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
  const embedDynamic = new EmbedBuilder()
  try {
    embedDynamic
      .setColor(roleColor)
      .setAuthor({ name: `${courseType}s Reminder`, iconURL: client.user.avatarURL() })
      .setTitle(`${subject} Reminder`)
      .setDescription(`Die ${courseType} fängt in ${lessonsOffset} Minuten an`)
      .setThumbnail('https://pics.freeicons.io/uploads/icons/png/6029094171580282643-512.png')
      .addFields([{ name: 'Dozent', value: professor, inline: false }])
      .setFooter({
        text: 'Viel Spaß und Erfolg wünscht euch euer ETIT-Master',
        iconURL: client.user.avatarURL(),
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
    embedDynamic.addFields([
      {
        name: 'Location:',
        value: `${location} [Maps](https://www.google.com/maps/search/KIT+${encodeURIComponent(location)})`,
        inline: false,
      },
    ])
  }

  /**
   * Return {@link EmbedBuilder}.
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
   * Remove multiple spaces, and replace them with a single space.
   * Remove leading and trailing space.
   */
  subject = subject.replace(/  +/g, ' ').trim()

  /**
   * Remove all content in, and brackets.
   */
  subject = subject.replace(/ *\([^)]*\) */g, '')

  /**
   * Guild to find role from.
   */
  const guild = client.guilds.cache.get(client.config.ids.serverID)

  /**
   * RoleID from {@link guild}.
   */
  const roleID = guild.roles.cache.find(_role => subject.toLowerCase() === _role.name.toLowerCase())?.id ?? null

  /**
   * Role from {@link guild}.
   */
  const role = roleID !== null ? `<@&${roleID}>` : ''

  /**
   * Return {@link role}.
   */
  return role
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
  embed: EmbedBuilder,
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
