const config = require("../../privateData/config.json")
const discord = require("discord.js")
const Tenor = require("tenorjs").client({
	Key: "U1BY9KJBOWIT", // https://tenor.com/developer/keyregistration
	Filter: "off", // "off", "low", "medium", "high", not case sensitive
	Locale: "en_US", // Your locale here, case-sensitivity depends on input
	MediaFilter: "minimal", // either minimal or basic, not case sensitive
	DateFormat: "D/MM/YYYY - H:mm:ss A" // Change this accordingly
})

exports.name = "tenor"

exports.description = "send gifs"

exports.usage = `${config.prefix}tenor <searchQuery>\n${config.prefix}gif <searchQuery>`

exports.aliases = ["gif"]

exports.run = (client, message, args) => {
	let searchQuery = ""
	for (word in args) {
		searchQuery = searchQuery + args[word] + " "
	}

	if (searchQuery.length == 0) {
		return message.channel.send("Bitte gebe einen suchwort an!")
	}

	Tenor.Search.Random(searchQuery, "1").then((Results) => {
		if (Results.length == 0)
			return message.channel.send("Es konnten keine Gifs gefunden werden!")
		Results.forEach((Post) => {
			message.reply(Post.url)
		})
	})
}
