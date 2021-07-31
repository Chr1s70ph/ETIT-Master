const config = require("../../private/config.json")

exports.name = "countdown"

exports.description = "Ein simpler countdown von 10 runter"

exports.usage = `${config.prefix}countdown`

exports.run = (client, message) => {
	message.channel.send("Liftoff in:")
	message.channel.send("🚀10🚀")
	setTimeout(() => {
		message.channel.send("🚀5🚀")
	}, 5000)
	setTimeout(() => {
		message.channel.send("🚀3🚀")
	}, 7000)
	setTimeout(() => {
		message.channel.send("🚀2🚀")
	}, 8000)
	setTimeout(() => {
		message.channel.send("🚀1🚀")
	}, 9000)
	setTimeout(() => {
		message.channel.send("Hurraaa 🚀🚀")
	}, 10000)
}
