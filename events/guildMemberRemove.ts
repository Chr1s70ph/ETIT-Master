import { GuildMember } from 'discord.js/typings/index.js'
import { DiscordClient } from '../types/customTypes'

exports.run = (client: DiscordClient, member: GuildMember) => {
  const guild = client.guilds.cache.get(client.config.ids.serverID)
  const memberCount = guild.memberCount
  const channel = guild.channels.cache.get(client.config.ids.channelIDs.dev.memberCounter)
  console.log(`${member.user.username} joined. Updated membercount to ${memberCount.toLocaleString()}`)
  channel.setName(`👥 ${memberCount.toLocaleString()} Mitglieder`)
}
