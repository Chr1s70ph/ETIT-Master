const config = require("../../private/config.json")
const discord = require("discord.js")

exports.name = "antwortaufalles"

exports.description = "Was ist die Antwort auf alles?"

exports.usage = `${config.prefix}antwortaufalles`

exports.run = async (client, message) => {
	return message.reply({
		embeds: [
			new discord.MessageEmbed().setDescription(
				"Die Antwort auf die Frage nach dem Leben, dem Universum und dem ganzen Rest ist :four::two:"
			)
		]
	})
}
