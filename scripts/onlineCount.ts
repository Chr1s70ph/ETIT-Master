import { Guild, GuildChannel, ThreadChannel } from "discord.js/typings/index.js"
const shedule = require("node-schedule")
import { DiscordClient } from "../index"
const online_refresh_timer = "*/15 * * * *"

exports.run = async (client: DiscordClient) => {
	const guild: Guild = client.guilds.cache.get(client.config.ids.serverID)
	const onlineCounterChannel: GuildChannel | ThreadChannel = guild.channels.cache.get(
		client.config.ids.channelIDs.dev.onlineCounter
	)

	shedule.scheduleJob(online_refresh_timer, async function () {
		let GUILD_MEMBERS = await client.guilds.cache
			.get(client.config.ids.serverID)
			.members.fetch({ withPresences: true })

		var onlineMembers = {
			online: await GUILD_MEMBERS.filter((online) => online.presence?.status === "online").size,
			idle: await GUILD_MEMBERS.filter((online) => online.presence?.status === "idle").size,
			dnd: await GUILD_MEMBERS.filter((online) => online.presence?.status === "dnd").size
		}

		let onlineCount: string = `🟢:${onlineMembers.online.toLocaleString()} 🟡:${onlineMembers.idle.toLocaleString()} 🔴:${onlineMembers.dnd.toLocaleString()}`

		onlineCounterChannel.setName(onlineCount)
		console.log(`Updated online Member count to ${onlineCount}`)
	})
}
