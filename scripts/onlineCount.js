const schedule = require("node-schedule")
const config = require("../private/config.json")
const online_refresh_timer = "*/15 * * * *"

exports.run = async (client) => {
	const guild = client.guilds.cache.get(config.ids.serverID)
	const onlineCounterChannel = guild.channels.cache.get(
		config.ids.channelIDs.dev.onlineCounter
	)

	schedule.scheduleJob(online_refresh_timer, async function () {
		let GUILD_MEMBERS = await client.guilds.cache
			.get(config.ids.serverID)
			.members.fetch({ withPresences: true })

		var onlineMembers = {
			online: await GUILD_MEMBERS.filter((online) => online.presence?.status === "online").size,
			idle: await GUILD_MEMBERS.filter((online) => online.presence?.status === "idle").size,
			dnd: await GUILD_MEMBERS.filter((online) => online.presence?.status === "dnd").size
		}

		let onlineCount = `🟢:${onlineMembers.online.toLocaleString()} 🟡:${onlineMembers.idle.toLocaleString()} 🔴:${onlineMembers.dnd.toLocaleString()}`

		onlineCounterChannel.setName(onlineCount)
		console.log(`Updated online Member count to ${onlineCount}`)
	})
}
