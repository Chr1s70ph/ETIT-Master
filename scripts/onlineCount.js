const schedule = require("node-schedule")
const config = require("../private/config.json")
const online_refresh_timer = "*/15 * * * *"

exports.run = async (client) => {
	const guild = client.guilds.cache.get(config.ids.serverID)
	const onlineCounterChannel = guild.channels.cache.get(
		config.ids.channelIDs.dev.onlineCounter
	)

	schedule.scheduleJob(online_refresh_timer, async function () {
		let onlineCount = await fetchNumberOfOnlineMembers(client)
		onlineCounterChannel.setName(`🟢Online:${onlineCount.toLocaleString()}`)
		console.log(`Updated online Member count to ${onlineCount.toLocaleString()}`)
	})
}

async function fetchNumberOfOnlineMembers(client) {
	let GUILD_MEMBERS = await client.guilds.cache
		.get(config.ids.serverID)
		.members.fetch({ withPresences: true })

	let online = await GUILD_MEMBERS.filter((online) => online.presence?.status === "online")
		.size

	let idle = await GUILD_MEMBERS.filter((online) => online.presence?.status === "idle").size

	let dnd = await GUILD_MEMBERS.filter((online) => online.presence?.status === "dnd").size

	return online + idle + dnd
}
