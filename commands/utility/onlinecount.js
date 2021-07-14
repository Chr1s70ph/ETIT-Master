const config = require("../../privateData/config.json")
const discord = require("discord.js")

exports.name = "onlinecount"

exports.description = "Zeigt an, wie viele Leute online, idle und auf dnd sind."

exports.usage = `${config.prefix}onlinecount`

exports.run = (client, message) => {
	let onlineCountEmbed = new discord.MessageEmbed() //Login Embed
		.setColor("#aaa540")
		.setTitle("[🌐] Online Counter")
		.setFooter(
			`[ID] ${config.ids.userID.botUserID}`,
			"https://image.flaticon.com/icons/png/512/888/888879.png"
		)

	let online = client.guilds.cache
		.get(config.ids.serverID)
		.members.cache.filter((m) => m.presence.status === "online").size
	let idle = client.guilds.cache
		.get(config.ids.serverID)
		.members.cache.filter((m) => m.presence.status === "idle").size
	let dnd = client.guilds.cache
		.get(config.ids.serverID)
		.members.cache.filter((m) => m.presence.status === "dnd").size

	onlineCountEmbed.addFields(
		{
			name: "🟢Online:",
			value: online,
			inline: false
		},
		{
			name: "🟡Idle:",
			value: idle,
			inline: false
		},
		{
			name: "🔴DND:",
			value: dnd,
			inline: false
		}
	)

	message.channel.send(onlineCountEmbed.setTimestamp())
}
