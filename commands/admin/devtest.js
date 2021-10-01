const config = require("../../private/config.json")
const discord = require("discord.js")
const pm2 = require("pm2")

exports.name = "devtest"

exports.description = "Testfunktion von neuen Features"

exports.usage = `${config.prefix}devtest`

exports.run = async (client, message) => {
	if (!Object.values(config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")
	console.log(client)
}
