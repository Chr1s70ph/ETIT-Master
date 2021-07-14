const config = require("../../privateData/config.json")

exports.name = "komedi"

exports.description = "Das Komedi Meme"

exports.usage = `${config.prefix}komedi`

exports.run = (client, message) => {
	message.channel.send(
		"https://cdn.discordapp.com/attachments/768117219812835378/818145599894847488/eqmmb89gml941.png"
	)
}
