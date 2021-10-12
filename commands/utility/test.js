const discord = require("discord.js")
const config = require("../../private/config.json")

exports.name = "test"

exports.description = "Prüft ob der Bot online und funktionstüchtig ist."

exports.usage = `${config.prefix}test`

exports.run = async (client, message) => {
	message.reply({
		embeds: [
			new discord.MessageEmbed()
				.setTitle("🌐 This Bot is working as intended!")
				.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
		]
	})
}
