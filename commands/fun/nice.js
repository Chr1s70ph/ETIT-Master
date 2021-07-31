const config = require("../../private/config.json")

exports.name = "nice"

exports.description = "nice"

exports.usage = `${config.prefix}nice`

exports.run = (client, message) => {
	message.channel.send("https://tenor.com/view/wii-bowling-nice-cock-perfect-gif-18674484")
}
