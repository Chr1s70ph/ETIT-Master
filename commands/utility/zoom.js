const config = require("../../private/config.json")

exports.name = "zoom"

exports.description = "Schickt ein Emoji, das beschreibt, worin Zoom am besten ist..."

exports.usage = `${config.prefix}zoom`

exports.aliases = ["loading"]

exports.run = async (client, message) => {
	message.channel.send("<a:loading:783688114509578271>")
}
