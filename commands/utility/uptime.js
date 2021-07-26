const config = require("../../privateData/config.json")

exports.name = "uptime"

exports.description = "Wie lange ist der Bot schon online"

exports.usage = `${config.prefix}uptime`

exports.run = (client, message) => {
	//fetch process uptime, and get rid of values, after decimal point
	let uptimeSeconds = process.uptime().toString().split(".")[0]
	//https://stackoverflow.com/a/1322771/10926046
	return message.reply(`${new Date(uptimeSeconds * 1000).toISOString().substr(11, 8)}`)
}
