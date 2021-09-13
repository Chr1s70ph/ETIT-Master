const pm2 = require("pm2")
const config = require("../../private/config.json")

exports.name = "restart"

exports.description = ""

exports.usage = `${config.prefix}restart`

exports.run = async (client, message) => {
	if (!Object.values(config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")

	message.channel.send("🤖Restarting...")
	pm2.connect(function (err) {
		if (err) {
			console.error(err)
			process.exit(2)
		}

		pm2.restart(process.env.pm_id, (err, proc) => {
			pm2.flush(process.env.pm_id, (err, proc) => {})
			pm2.disconnect()
		})
	})
}
