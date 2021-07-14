const pm2 = require("pm2")
const config = require("../../privateData/config.json")

exports.name = "restart"

exports.description = ""

exports.usage = `${config.prefix}restart`

exports.run = (client, message) => {
	if (!Object.values(config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")

	message.channel.send("🤖Restarting...")
	pm2.connect(function (err) {
		if (err) {
			console.error(err)
			process.exit(2)
		}

		pm2.restart("0", (err, proc) => {})
		pm2.flush("0", (err, proc) => {})
		pm2.restart("0", (err, proc) => {})
	})
}
