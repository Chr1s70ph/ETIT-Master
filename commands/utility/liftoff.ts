import { DiscordClient } from "../../index"
import { Message, MessageEmbed } from "discord.js"
exports.name = "liftoff"

exports.description = "Liftoff celebration"

exports.usage = "liftoff"

exports.run = async (client: DiscordClient, message: Message) => {
	message.channel.send({
		embeds: [
			new MessageEmbed()
				.setTitle("Hurraaa 🚀🚀")
				.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
		]
	})
}
