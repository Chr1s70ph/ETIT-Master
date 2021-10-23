import * as fs from "fs"
import { DiscordClient } from "../../index"
import { Message, MessageEmbed } from "discord.js"

const FACTS_FILE = "./data/facts.txt"

exports.name = "fact"

exports.description = "Willst du Fakten? Dann bist du hier genau richtig."

exports.usage = "fact"

exports.run = async (client: DiscordClient, message: Message) => {
	fs.readFile(FACTS_FILE, "utf-8", function (err, data) {
		if (err) {
			throw err
		}
		data += ""
		var lines = data.split("\n")

		// choose one of the lines...
		var line = lines[Math.floor(Math.random() * lines.length)]

		return message.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle("🧠Fact")
					.setDescription(line)
					.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
			]
		})
	})
}
