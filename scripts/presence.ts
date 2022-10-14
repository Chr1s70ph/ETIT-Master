import { PresenceData } from 'discord.js'
import { scheduleJob } from 'node-schedule'
import { DiscordClient } from '../types/customTypes'
const presence_refresh_timer = '15 * * * * *'

exports.run = async (client: DiscordClient) => {
  /**
   * All presences in {@link DiscordClient.config}
   */
  const presenceVariants = client.config.presence

  /**
   * Last index of presences in {@link DiscordClient.config}
   */
  const maxNumberOfPresence = Object.keys(presenceVariants).length
  /**
   * First index of presences in {@link DiscordClient.config}
   */
  const minNumberOfPresence = 0

  await updatePresence(client, maxNumberOfPresence, minNumberOfPresence, presenceVariants)
}

/**
 * Update client presence.
 * @param {DiscordClient} client Bot-Client
 * @param {number} maxNumberOfPresence Last index of presences in {@link DiscordClient.config}
 * @param {number} minNumberOfPresence First index of presences in {@link DiscordClient.config}
 * @param {any} presenceVariants All presences in {@link DiscordClient.config}
 * @returns {Promise}
 */
async function updatePresence(
  client: DiscordClient,
  maxNumberOfPresence: number,
  minNumberOfPresence: number,
  presenceVariants: any,
): Promise<void> {
  /**
   * Shedule update of presence with {@link presence_refresh_timer}.
   */
  await scheduleJob(presence_refresh_timer, () => {
    /**
     * Custom presence defined by the status command.
     */
    const customPresence: PresenceData = client.customPresence

    /**
     * Prioritize {@link customPresence} and always set, if defined.
     */
    if (customPresence) {
      /**
       * Set presence.
       */
      client.user.setPresence(customPresence)
    } else {
      /**
       * Select random presence from {@link DiscordClient.config}.
       */
      const randomIndex = Math.floor(Math.random() * (maxNumberOfPresence - minNumberOfPresence) + minNumberOfPresence)

      const presence: PresenceData = presenceVariants[randomIndex]
      /**
       * Set presence.
       */
      client.user.setPresence(presence)
    }
  })
}
