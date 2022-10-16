import { Collection } from 'discord.js'
import { async } from 'node-ical'
import { DiscordClient } from './customTypes'

/**
 * Fetches and saves all calendars defined in the config.
 * Calendars are cached in {@link DiscordClient.calendars}
 * @param {DiscordClient} client Client Object
 */
export async function fetchAndCacheCalendars(client: DiscordClient): Promise<void> {
  client.calendars = new Collection()
  for (const calendar in client.config.calendars) {
    /* eslint-disable no-await-in-loop */
    client.calendars.set(calendar, await async.fromURL(client.config.calendars[calendar]))
  }
}
