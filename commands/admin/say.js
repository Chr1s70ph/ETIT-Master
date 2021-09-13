const config = require("../../private/config.json")
const discord = require("../../node_modules/discord.js")

exports.name = "say"

exports.description =
	"Der Bot sagt, was man ihm sagt, dass er sagen soll, weil er dir nach sagt."

exports.usage = `${config.prefix}say`

exports.run = async (client, message) => {
	if (!Object.values(config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")

	const embed = new discord.MessageEmbed()

	var messageContent = message.content.substring(message.content.indexOf(" ") + 1)

	embed.setDescription(messageContent)
	message.channel.send({ embeds: [embed] })
}
