const config = require("../../private/config.json")
const discord = require("discord.js")

exports.name = "onlinecount"

exports.description = "Zeigt an, wie viele Leute online, idle und auf dnd sind."

exports.usage = `${config.prefix}onlinecount`

exports.run = async (client, message) => {
	let onlineCountEmbed = new discord.MessageEmbed() //Login Embed
		.setColor("#aaa540")
		.setTitle("[🌐] Online Counter")
		.setFooter(
			`[ID] ${config.ids.userID.botUserID}`,
			"https://image.flaticon.com/icons/png/512/888/888879.png"
		)

	let GUILD_MEMBERS = await client.guilds.cache
		.get(config.ids.serverID)
		.members.fetch({ withPresences: true })

	let online = await GUILD_MEMBERS.filter((online) => online.presence?.status === "online")
		.size

	let idle = await GUILD_MEMBERS.filter((online) => online.presence?.status === "idle").size

	let dnd = await GUILD_MEMBERS.filter((online) => online.presence?.status === "dnd").size

	onlineCountEmbed.addFields(
		{
			name: "🟢Online:",
			value: `${online}`,
			inline: false
		},
		{
			name: "🟡Idle:",
			value: `${idle}`,
			inline: false
		},
		{
			name: "🔴DND:",
			value: `${dnd}`,
			inline: false
		}
	)

	message.channel.send({ embeds: [onlineCountEmbed.setTimestamp()] })
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
