import { Guild, GuildChannel, ThreadChannel } from 'discord.js/typings/index.js'
import { scheduleJob } from 'node-schedule'
import { DiscordClient } from '../types/customTypes'
const online_refresh_timer = '*/20 * * * *'

exports.run = async (client: DiscordClient) => {
  /**
   * Guild to update onlinecounter.
   */
  const guild: Guild = client.guilds.cache.get(client.config.ids.serverID)

  /**
   * Channel name to update, to set onlineCounter.
   */
  const onlineCounterChannel: GuildChannel | ThreadChannel = guild.channels.cache.get(
    client.config.ids.channelIDs.dev.onlineCounter,
  )

  /**
   * Set online count as channel name.
   */
  await setOnlineCount(client, onlineCounterChannel)
}
/**
 * Fetch number of online members and update channel name.
 * @param {DiscordClient} client Bot-Client
 * @param {GuildChannel|ThreadChannel} onlineCounterChannel Channel name to update, to set onlineCounter.
 * @returns {Promise}
 */
async function setOnlineCount(
  client: DiscordClient,
  onlineCounterChannel: GuildChannel | ThreadChannel,
): Promise<void> {
  /**
   * Schedule update of online counter.
   */
  await scheduleJob(online_refresh_timer, async () => {
    /**
     * Forcefetch all guild members.
     */
    const GUILD_MEMBERS = await client.guilds.cache
      .get(client.config.ids.serverID)
      .members.fetch({ withPresences: true })

    /**
     * Filter {@link GUILD_MEMBERS} and get online count numbers.
     */
    const onlineMembers = {
      online: GUILD_MEMBERS.filter(online => online.presence?.status === 'online').size.toLocaleString(),
      idle: GUILD_MEMBERS.filter(online => online.presence?.status === 'idle').size.toLocaleString(),
      dnd: GUILD_MEMBERS.filter(online => online.presence?.status === 'dnd').size.toLocaleString(),
    }

    /**
     * Channel name to set {@link onlineCounterChannel} to.
     */
    const onlineCount = `🟢:${onlineMembers.online} 🟡:${onlineMembers.idle} 🔴:${onlineMembers.dnd}`

    /**
     * Update channel name.
     */
    onlineCounterChannel.setName(onlineCount)
  })
}
