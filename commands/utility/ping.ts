import { DiscordClient } from "../../types/customTypes"
import { Message } from "discord.js"
exports.name = "ping"

exports.description = "pong"

exports.usage = "ping"

exports.run = async (client: DiscordClient, message: Message) => {
	message.channel.send(
		`🏓Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(
			client.ws.ping
		)}ms`
	)
}
