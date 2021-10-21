import { DiscordClient } from "../index"
import { GuildMember } from "discord.js/typings/index.js"

exports.run = async (client: DiscordClient, member: GuildMember) => {
	const guild = client.guilds.cache.get(client.config.ids.serverID)
	const memberCount = guild.memberCount
	const channel = guild.channels.cache.get(client.config.ids.channelIDs.dev.memberCounter)
	channel.setName(`👥 ${memberCount.toLocaleString()} Mitglieder`)
	console.log(
		`${member.user.username} joined. Updated membercount to ${memberCount.toLocaleString()}`
	)
}
