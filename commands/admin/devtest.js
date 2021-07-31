const config = require("../../private/config.json")
const discord = require("discord.js")
const pm2 = require("pm2")

exports.name = "devtest"

exports.description = "Testfunktion von neuen Features"

exports.usage = `${config.prefix}devtest`

exports.run = async (client, message) => {
	console.log(process.env.pm_id)
}
