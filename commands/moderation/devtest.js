const config = require("../../privateData/config.json")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const discord = require("discord.js")

exports.name = "devtest"

exports.description = "Testfunktion von neuen Features"

exports.usage = `${config.prefix}devtest`

exports.run = async (client, message) => {
	message.channel.send(
		"🟢Online: " +
			client.guilds.cache
				.get(config.ids.serverID)
				.members.cache.filter((m) => m.presence.status === "online").size
	)
	message.channel.send(
		"🟡Idle: " +
			client.guilds.cache
				.get(config.ids.serverID)
				.members.cache.filter((m) => m.presence.status === "idle").size
	)
	message.channel.send(
		"🔴DND: " +
			client.guilds.cache
				.get(config.ids.serverID)
				.members.cache.filter((m) => m.presence.status === "dnd").size
	)
}
