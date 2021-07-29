const config = require("../../privateData/config.json")
const discord = require("discord.js")

exports.name = "devtest"

exports.description = "Testfunktion von neuen Features"

exports.usage = `${config.prefix}devtest`

exports.run = async (client, message) => {
	const embed = new discord.MessageEmbed() //Login Embed
		.setColor("#ffa500")
		.setAuthor(client.user.tag, "https://www.iconsdb.com/icons/preview/orange/code-xxl.png")
		.setThumbnail(
			client.guilds
				.resolve(config.ids.serverID)
				.members.resolve(config.ids.userID.botUserID)
				.user.avatarURL()
		)
		.setTitle("[🌐] Bot erfolgreich gestartet")
		.addFields({
			name: "Prozessor:",
			value: "Intel Xeon X3480 (8) @ 3.068GHz",
			inline: true
		})
		.setTimestamp()
		.setFooter(
			`[ID] ${config.ids.userID.botUserID} \nstarted`,
			"https://image.flaticon.com/icons/png/512/888/888879.png"
		)

	var role = "<@&776121965764673566>"

	client.channels.cache.get("852530207336169523").send({ content: role, embeds: [embed] })
}
