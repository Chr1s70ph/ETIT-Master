const config = require("../../private/config.json")
const discord = require("discord.js")

exports.name = "uptime"

exports.description = "Wie lange ist der Bot schon online"

exports.usage = `${config.prefix}uptime`

exports.run = async (client, message) => {
	let uptime = {
		days: null,
		hours: null,
		minutes: null,
		seconds: null
	}

	// https://stackoverflow.com/a/36099084/10926046
	uptime.seconds = process.uptime().toString().split(".")[0]

	uptime.days = Math.floor(uptime.seconds / (3600 * 24))
	uptime.seconds -= uptime.days * 3600 * 24
	uptime.hours = Math.floor(uptime.seconds / 3600)
	uptime.seconds -= uptime.hours * 3600
	uptime.minutes = Math.floor(uptime.seconds / 60)
	uptime.seconds -= uptime.minutes * 60

	return message.reply({
		embeds: [
			new discord.MessageEmbed()
				.setTitle("⏰Uptime")
				.addField(
					"Time since last restart:",
					uptime.days +
						" Days, " +
						uptime.hours +
						" Hours, " +
						uptime.minutes +
						" Minutes, " +
						uptime.seconds +
						" Seconds"
				)
				.setColor("#FF4040")
		]
	})
}
