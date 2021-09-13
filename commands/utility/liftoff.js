const config = require("../../private/config.json")

exports.name = "liftoff"

exports.description = "Liftoff celebration"

exports.usage = `${config.prefix}liftoff`

exports.run = async (client, message) => {
	message.channel.send("Hurraaa 🚀🚀")
}
