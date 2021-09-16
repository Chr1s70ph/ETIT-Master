const config = require("../../private/config.json")
const discord = require("../../node_modules/discord.js")

exports.name = "say"

exports.description =
	"Der Bot sagt, was man ihm sagt, dass er sagen soll, weil er dir nach sagt."

exports.usage = `${config.prefix}say`

exports.run = async (client, message) => {
	if (!Object.values(config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")

	let messageContent = message.content.substring(
		message.content.indexOf(" ") + config.prefix.length
	)

	const embed = new discord.MessageEmbed()
		.setDescription(messageContent === `${config.prefix}say` ? "᲼" : messageContent)
		.setColor("RANDOM")

	let messageAttachment =
		message.attachments.size > 0 ? message.attachments.first().url : null
	embed.setImage(messageAttachment)

	if (message.type === "REPLY") {
		return (message = message.channel.messages
			.fetch(message.reference.messageId)
			.then((message) => message.reply({ embeds: [embed] })))
	}
	message.channel.send({ embeds: [embed] })
}
