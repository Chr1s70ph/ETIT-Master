import { DiscordClient } from "../../index"
import { Message } from "discord.js"
import { connect, disconnect, flush, restart } from "pm2"
exports.name = "restart"

exports.description = ""

exports.usage = "restart"

exports.run = async (client: DiscordClient, message: Message) => {
	if (!Object.values(client.config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")

	message.channel.send("🤖Restarting...")
	connect(function (err) {
		if (err) {
			console.error(err)
			process.exit(2)
		}

		restart(process.env.pm_id, (err, proc) => {
			flush(process.env.pm_id, (err, proc) => {})
			disconnect()
		})
	})
}
