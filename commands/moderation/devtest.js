const config = require("../../privateData/config.json")
const { MessageButton, MessageActionRow } = require("discord-buttons")
const discord = require("discord.js")

exports.name = "devtest"

exports.description = "Testfunktion von neuen Features"

exports.usage = `${config.prefix}devtest`

exports.run = async (client, message) => {
	let answerMessage = message.reply("nice").then((msg) => {
		client.emojis.cache.forEach((element) => {
			console.log(element.name)
		})
	})
}
