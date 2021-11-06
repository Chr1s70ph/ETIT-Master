import { DiscordClient } from "../../types/customTypes"
import { Message, MessageEmbed } from "discord.js"

exports.name = "antwortaufalles"

exports.description = "Was ist die Antwort auf alles?"

exports.usage = "antwortaufalles"

exports.run = async (client: DiscordClient, message: Message) => {
	return message.reply({
		embeds: [
			new MessageEmbed().setDescription(
				"Die Antwort auf die Frage nach dem Leben, dem Universum und dem ganzen Rest ist :four::two:"
			)
		]
	})
}
