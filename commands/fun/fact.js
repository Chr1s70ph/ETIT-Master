const config = require("../../private/config.json")
const fs = require("fs")
const discord = require("discord.js")
const filename = "./data/facts.txt"

exports.name = "fact"

exports.description = "Fakten"

exports.usage = `${config.prefix}fact`

exports.run = async (client, message) => {
	fs.readFile(filename, "utf-8", function (err, data) {
		if (err) {
			throw err
		}
		data += ""
		var lines = data.split("\n")

		// choose one of the lines...
		var line = lines[Math.floor(Math.random() * lines.length)]

		message.channel.send({
			embeds: [
				new discord.MessageEmbed()
					.setTitle("🧠Fact")
					.setDescription(line)
					.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
			]
		})
	})
}
