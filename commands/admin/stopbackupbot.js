const pm2 = require("pm2")
const config = require("../../private/config.json")

exports.name = "stopbackupbot"

exports.description = "stops backup bot"

exports.usage = `${config.prefix}stopbackupbot`

exports.run = (client, message) => {
	if (!Object.values(config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")

	message.channel.send("Stopping Backup Bot...")
	pm2.connect(function (err) {
		if (err) {
			console.error(err)
			process.exit(2)
		}

		pm2.stop("ETIT-Chef", (err, proc) => {
			pm2.disconnect()
		})
	})
}
