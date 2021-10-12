const config = require("../../private/config.json")
const discord = require("discord.js")

exports.name = "komedi"

exports.description = "Das Komedi Meme"

exports.usage = `${config.prefix}komedi`

exports.run = async (client, message) => {
	return message.reply({
		embeds: [
			new discord.MessageEmbed()
				.setImage(
					"https://cdn.discordapp.com/attachments/768117219812835378/818145599894847488/eqmmb89gml941.png"
				)
				.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
		]
	})
}
