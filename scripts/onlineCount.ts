import { Guild, GuildChannel, ThreadChannel } from 'discord.js/typings/index.js'
import { scheduleJob } from 'node-schedule'
import { DiscordClient } from '../types/customTypes'
const online_refresh_timer = '*/15 * * * *'

exports.run = async (client: DiscordClient) => {
  const guild: Guild = client.guilds.cache.get(client.config.ids.serverID)
  const onlineCounterChannel: GuildChannel | ThreadChannel = guild.channels.cache.get(
    client.config.ids.channelIDs.dev.onlineCounter,
  )

  await setOnlineCount(client, onlineCounterChannel)
}

async function setOnlineCount(
  client: DiscordClient,
  onlineCounterChannel: GuildChannel | ThreadChannel,
): Promise<void> {
  await scheduleJob(online_refresh_timer, async () => {
    const GUILD_MEMBERS = await client.guilds.cache
      .get(client.config.ids.serverID)
      .members.fetch({ withPresences: true })

    const onlineMembers = {
      online: GUILD_MEMBERS.filter(online => online.presence?.status === 'online').size.toLocaleString(),
      idle: GUILD_MEMBERS.filter(online => online.presence?.status === 'idle').size.toLocaleString(),
      dnd: GUILD_MEMBERS.filter(online => online.presence?.status === 'dnd').size.toLocaleString(),
    }

    const onlineCount = `🟢:${onlineMembers.online} 🟡:${onlineMembers.idle} 🔴:${onlineMembers.dnd}`

    onlineCounterChannel.setName(onlineCount)
  })
}
