import { Collection } from 'discord.js'
import moment from 'moment'
import { async } from 'node-ical'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordButtonInteraction } from './customTypes'

/**
 * Fetches and saves all calendars defined in the config.
 * Calendars are cached in {@link DiscordClient.calendars}
 * @param {DiscordClient} client Client Object
 */
export async function fetchAndCacheCalendars(client: DiscordClient): Promise<void> {
  if (client.calendars !== undefined) client.calendars = undefined
  client.calendars = new Collection()
  for (const calendar in client.config.calendars) {
    /* eslint-disable no-await-in-loop */
    client.calendars.set(calendar, await async.fromURL(client.config.calendars[calendar]))
    console.log(`'${calendar}' calendar fetched & cached`)
  }
}

/**
 * Extracts the zoom Links from HTML tag
 * if the HTML tag contains "#success" it cuts the string before that string, to make the link automatically open zoom
 * @param {string} eventLinkString string to extract link from
 * @returns {string} well formed url
 */
export function extractZoomLinks(eventLinkString: string): string {
  if (eventLinkString === undefined || eventLinkString.length === 0 || !validURL(eventLinkString)) return undefined

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
 * Test if input string is valid URL
 * @param {string} str Input string to test
 * @returns {boolean}
 */
function validURL(str: string): boolean {
  /**
   * Stolen from StackOverflow: https://stackoverflow.com/a/5717133/10926046
   */
  const pattern = new RegExp(
    // Protocol
    '^(https?:\\/\\/)?' +
      // Domain name
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      // OR ip (v4) address
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      // Port and path
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      // Query string
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      // Fragment locator
      '(\\#[-a-z\\d_]*)?$',
    'i',
  )
  return !!pattern.test(str)
}

export function filterEvents(
  calendars_object: any,
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
  pMessageOrInteraction: DiscordChatInputCommandInteraction | DiscordButtonInteraction,
  relevantEvents: any[],
  is_exams_command: boolean,
) {
  for (const i in calendars_object) {
    const event = calendars_object[i]
    if (calendars_object[i].type === 'VEVENT') {
      const startDate = moment(event.start)
      const endDate = moment(event.end)
      rruleFilter(
        event,
        startDate,
        rangeStart,
        rangeEnd,
        pMessageOrInteraction,
        relevantEvents,
        endDate,
        is_exams_command,
      )
    }
  }
}

function rruleFilter(
  event: any,
  startDate: moment.Moment,
  rangeStart: moment.Moment,
  rangeEnd: moment.Moment,
  pMessageOrInteraction: DiscordChatInputCommandInteraction | DiscordButtonInteraction,
  relevantEvents: any[],
  endDate: moment.Moment,
  is_exams_command: boolean,
) {
  if (typeof event.rrule === 'undefined') {
    if (is_exams_command === true) {
      if (startDate.isBetween(rangeStart, rangeEnd) && event.summary.toLowerCase().includes('klausur')) {
        pushToWeeksEvents(pMessageOrInteraction, event, startDate, endDate, relevantEvents)
      }
    } else if (startDate.isBetween(rangeStart, rangeEnd)) {
      pushToWeeksEvents(pMessageOrInteraction, event, startDate, endDate, relevantEvents)
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

      if (is_exams_command === true) {
        if (relevantRecurrence === true && event.summary.toLowerCase().includes('klausur')) {
          pushToWeeksEvents(pMessageOrInteraction, curEvent, startDate, endDate, relevantEvents)
        }
      } else if (relevantRecurrence === true) {
        pushToWeeksEvents(pMessageOrInteraction, curEvent, startDate, endDate, relevantEvents)
      }
    }
  }
}

function pushToWeeksEvents(
  interaction: any,
  event: any,
  event_start: moment.Moment,
  event_end: moment.Moment,
  relevantEvents: any[],
) {
  /**
   * Account the fact, that an event may have been created back in DST
   * or vice verca and adjust the event start times accordingly
   * (Why is this not done by node-ical natively urgh)
   */
  if (moment(event.created).isDST() !== event_start.isDST() && moment(event.start).isDST() !== true) {
    if (moment(event.created).isDST()) {
      event_start.subtract(1, 'hour')
      event_end.subtract(1, 'hour')
    } else {
      event_start.add(1, 'hour')
      event_end.add(1, 'hour')
    }
  } else if (moment(event.created).isDST() === false && moment(event.start).isDST() === false) {
    event_start.subtract(1, 'hour')
    event_end.subtract(1, 'hour')
  }

  if (doubleEntry(relevantEvents, event, event_start)) {
    return
  }
  /**
   * Only the case, if function is being called from iCalReader
   */
  if (interaction === undefined) {
    /**
     * Add entry with new key.
     * Key increments by one (determined by length).
     */
    relevantEvents[Object.keys(relevantEvents).length] = {
      start: new Date(`${event_start.toString().slice(0, -12)}z`),
      end: new Date(`${event_end.toString().slice(0, -12)}z`),
      summary: event.summary,
      description: event.description,
      location: event.location,
    }
  } else {
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
          start: new Date(`${event_start.toString().slice(0, -12)}z`),
          end: new Date(`${event_end.toString().slice(0, -12)}z`),
          summary: event.summary,
          description: event.description,
          location: event.location,
        }
      }
    }
  }
}

/**
 * Check if the new element added to @link{array} creates a duplicate
 * @param {any[]} array array to check
 * @param  {any} new_element new element on which to check if duplicate
 * @param  {moment.Moment} event_start new element startDate
 * @returns {boolean}
 */
function doubleEntry(array: any[], new_element: any, event_start: moment.Moment): boolean {
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
      array[entry].summary === new_element.summary &&
      array[entry].description === new_element.description &&
      array[entry].start.getHours() === new Date(`${event_start.toString().slice(0, -12)}z`).getHours()
    ) {
      return true
    }
  }

  /**
   * If no duplicates have been found, return false
   */
  return false
}
