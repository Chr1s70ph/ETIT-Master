const config = require("../../private/config.json")
const discord = require("discord.js")

exports.name = "liftoff"

exports.description = "Liftoff celebration"

exports.usage = `${config.prefix}liftoff`

exports.run = async (client, message) => {
	message.channel.send({
		embeds: [
			new discord.MessageEmbed()
				.setTitle("Hurraaa 🚀🚀")
				.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
		]
	})
}
