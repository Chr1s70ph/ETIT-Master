import { DiscordClient } from "../../index"
import { Message, MessageEmbed } from "discord.js"
exports.name = "onlinecount"

exports.description = "Zeigt an, wie viele Leute online, idle und auf dnd sind."

exports.usage = "onlinecount"

exports.run = async (client: DiscordClient, message: Message) => {
	let onlineCountEmbed = new MessageEmbed() //Login Embed
		.setColor("#aaa540")
		.setTitle("[🌐] Online Counter")
		.setFooter(
			`[ID] ${client.config.ids.userID.botUserID}`,
			"https://image.flaticon.com/icons/png/512/888/888879.png"
		)

	let GUILD_MEMBERS = await client.guilds.cache
		.get(client.config.ids.serverID)
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

async function fetchNumberOfOnlineMembers(client: DiscordClient) {
	let GUILD_MEMBERS = await client.guilds.cache
		.get(client.config.ids.serverID)
		.members.fetch({ withPresences: true })

	let online = await GUILD_MEMBERS.filter((online) => online.presence?.status === "online")
		.size

	let idle = await GUILD_MEMBERS.filter((online) => online.presence?.status === "idle").size

	let dnd = await GUILD_MEMBERS.filter((online) => online.presence?.status === "dnd").size

	return online + idle + dnd
}
