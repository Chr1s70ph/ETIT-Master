const config = require("../private/config.json")

exports.run = async (client, message) => {
	const guild = client.guilds.cache.get(config.ids.serverID)
	const memberCount = guild.memberCount
	const channel = guild.channels.cache.get(config.ids.channelIDs.dev.memberCounter)
	channel.setName(`👥 Mitglieder:${memberCount.toLocaleString()}`)
	console.log(`New Member joined. Updated membercount to ${memberCount.toLocaleString()}`)
}
