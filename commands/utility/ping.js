const config = require("../../private/config.json")

exports.name = "ping"

exports.description = "pong"

exports.usage = `${config.prefix}ping`

exports.run = async (client, message) => {
	message.channel.send(
		`🏓Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(
			client.ws.ping
		)}ms`
	)
}
