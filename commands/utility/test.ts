import { DiscordClient } from "../../index"
import { Message, MessageEmbed } from "discord.js"

exports.name = "test"

exports.description = "Prüft ob der Bot online und funktionstüchtig ist."

exports.usage = "test"

exports.run = async (client: DiscordClient, message: Message) => {
	message.reply({
		embeds: [
			new MessageEmbed()
				.setTitle("🌐 This Bot is working as intended!")
				.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
		]
	})
}
