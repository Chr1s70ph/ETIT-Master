import { DiscordClient } from "../../index"
import { Message } from "discord.js"
exports.name = "zoom"

exports.description = "Schickt ein Emoji, das beschreibt, worin Zoom am besten ist..."

exports.usage = "zoom"

exports.aliases = ["loading"]

exports.run = async (client: DiscordClient, message: Message) => {
	message.channel.send("<a:loading:783688114509578271>")
}
