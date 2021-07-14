const config = require("../../privateData/config.json")

exports.name = "say"

exports.description =
	"Der Bot sagt, was man ihm sagt, dass er sagen soll, weil er dir nach sagt."

exports.usage = `${config.prefix}say`

exports.run = (client, message) => {
	if (!Object.values(config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")

	var content = message.content

	var command = content.substring(content.indexOf(" ") + 1)
	message.channel.send(command)
}
