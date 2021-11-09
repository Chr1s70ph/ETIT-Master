import { scheduleJob } from 'node-schedule'
import { DiscordClient } from '../types/customTypes'
const presence_refresh_timer = '15 * * * * *'
const custom_presence = require('../commands/admin/status.ts')

exports.run = async (client: DiscordClient) => {
  const presenceVariants = client.config.presence
  const maxNumberOfPresence = Object.keys(presenceVariants).length
  const minNumberOfPresence = 0

  await scheduleJob(presence_refresh_timer, () => {
    const customPresence = custom_presence.presence
    if (customPresence.activities[0].name !== '') {
      client.user.setPresence(customPresence)
    } else {
      const randomIndex = Math.floor(Math.random() * (maxNumberOfPresence - minNumberOfPresence) + minNumberOfPresence)
      client.user.setPresence(presenceVariants[randomIndex])
    }
  })
}
