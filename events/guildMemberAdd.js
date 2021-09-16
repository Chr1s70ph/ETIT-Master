const config = require("../private/config.json")
const discord = require("discord.js")

exports.run = async (client, member) => {
	const guild = client.guilds.cache.get(config.ids.serverID)
	const memberCount = guild.memberCount
	const channel = guild.channels.cache.get(config.ids.channelIDs.dev.memberCounter)
	channel.setName(`👥 ${memberCount.toLocaleString()} Mitglieder`)
	console.log(
		`${member.user.username} joined. Updated membercount to ${memberCount.toLocaleString()}`
	)

	let welcomeMessage = new discord.MessageEmbed()
		.setTitle(`🗲 Willkommen auf dem ETIT-KIT Server ${member.user.username} 🗲`)
		.setColor("#FFDA00")
		.setAuthor(client.user.tag, member.guild.iconURL())
		.setThumbnail(
			client.guilds
				.resolve(config.ids.serverID)
				.members.resolve(config.ids.userID.botUserID)
				.user.avatarURL()
		)
		.setDescription(`Wir hoffen, dass der Server dir gefällt, und dir im Studium weiterhelfen kann.
		In <#830837597587767306> kannst du deinen Studiengang auswählen.
		In der Kategorie <#830891013266604062> findest du dann weitere Kanäle, in denen du deine Fächer auswählen kannst.
		
		Falls du noch irgendwelche Fragen hast, wende dich einfach an einen Admin des Servers (wir sind auch nur einfache Studenten, genauso wie du).`)

	try {
		member.send({ embeds: [welcomeMessage] })
		console.log(`Sent welcome message to ${member.user.username}`)
	} catch (error) {
		throw new Error(error)
	}
}
