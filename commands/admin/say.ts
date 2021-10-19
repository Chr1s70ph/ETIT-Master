import { MessageEmbed } from "discord.js"

exports.name = "say"

exports.description =
	"Der Bot sagt, was man ihm sagt, dass er sagen soll, weil er dir nach sagt."

exports.usage = "say <messageContent>"

exports.run = async (client, message) => {
	if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")

	let messageContent = message.content.substring(
		message.content.indexOf(" ") + client.config.prefix.length
	)

	const embed = new MessageEmbed()
		.setDescription(messageContent === `${client.config.prefix}say` ? "᲼" : messageContent)
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
